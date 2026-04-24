#!/usr/bin/env node
import fs from "node:fs";

const LEGACY_POSITION_MAPPINGS = [
  {
    sourceNamespace: "dashboard-layout-eg",
    sourceItem: "KNX_Helios_KWRL_Ist_Stufe",
    targetEquipment: "KNX_Helios_KWRL",
  },
  {
    sourceNamespace: "dashboard-layout-eg",
    sourceItem: "KNX_Helios_ManualMode",
    targetEquipment: "KNX_Helios_KWRL",
  },
  {
    sourceNamespace: "dashboard-layout-living",
    sourceItem: "KNX_JA1_Raffstore_Wohnzimmer",
    targetEquipment: "Equ_Raffstore_Terrasse",
  },
  {
    sourceNamespace: "dashboard-layout-living",
    sourceItem: "KNX_JA1_Raffstore_Wohnzimmer_Strasse",
    targetEquipment: "Equ_Raffstore_Strasse",
  },
  {
    sourceNamespace: "dashboard-layout-living",
    sourceItem: "SAH3_Licht_Couch",
    targetEquipment: "Equ_Spots_Couch",
  },
  {
    sourceNamespace: "dashboard-layout-living",
    sourceItem: "SAH3_Licht_TV",
    targetEquipment: "Equ_Spots_TV",
  },
  {
    sourceNamespace: "dashboard-layout-living",
    sourceItem: "Samsung_TV_Wohnzimmer_Power",
    targetEquipment: "Samsung_TV_Wohnzimmer",
  },
  {
    sourceNamespace: "dashboard-layout-living",
    sourceItem: "Shelly_Plug_Wohnzimmer_Betrieb",
    targetEquipment: "Shelly_Plug_Wohnzimmer",
  },
];

const TARGET_NAMESPACE = "dashboard-layout";

const readEnvFile = (path) => {
  if (!fs.existsSync(path)) {
    return {};
  }
  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map((match) => {
        const [, key, rawValue] = match;
        const value = rawValue.replace(/^["']|["']$/g, "");
        return [key, value];
      })
  );
};

const env = { ...readEnvFile(".env"), ...process.env };
const mode = process.argv.includes("--apply") ? "apply" : "dry-run";
const protocol = env.VITE_OPENHAB_PROTOCOL || "https";
const host = env.VITE_OPENHAB_HOST || "192.168.1.15";
const port = env.VITE_OPENHAB_PORT || (protocol === "https" ? "9443" : "8080");
const baseUrl = env.OPENHAB_REST_URL || `${protocol}://${host}:${port}/rest`;
const token = env.VITE_OPENHAB_API_TOKEN || env.OPENHAB_API_TOKEN || "";

if (env.VITE_OPENHAB_INSECURE === "true" || env.OPENHAB_INSECURE === "true") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const headers = token ? { Authorization: `Bearer ${token}` } : {};

const metadataUrl = (itemName, namespace) =>
  `${baseUrl}/items/${encodeURIComponent(itemName)}/metadata/${encodeURIComponent(
    namespace
  )}`;

const fetchMetadata = async (itemName, namespace) => {
  const directResponse = await fetch(metadataUrl(itemName, namespace), {
    headers,
  });
  if (directResponse.ok) {
    return directResponse.json();
  }
  if (directResponse.status !== 405 && directResponse.status !== 404) {
    throw new Error(
      `Failed to fetch ${namespace}:${itemName} (${directResponse.status})`
    );
  }

  const itemResponse = await fetch(
    `${baseUrl}/items/${encodeURIComponent(itemName)}?metadata=${encodeURIComponent(
      namespace
    )}`,
    { headers }
  );
  if (!itemResponse.ok) {
    if (itemResponse.status === 404) {
      return null;
    }
    throw new Error(
      `Failed to fetch item ${itemName} metadata ${namespace} (${itemResponse.status})`
    );
  }
  const item = await itemResponse.json();
  return item.metadata?.[namespace] ?? null;
};

const putMetadata = async (itemName, metadata) => {
  const response = await fetch(metadataUrl(itemName, TARGET_NAMESPACE), {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to write ${TARGET_NAMESPACE}:${itemName} (${response.status})`
    );
  }
};

const hasPositionConfig = (metadata) =>
  metadata?.config &&
  typeof metadata.config.x !== "undefined" &&
  typeof metadata.config.y !== "undefined";

const migrate = async () => {
  const plannedWrites = new Map();

  for (const mapping of LEGACY_POSITION_MAPPINGS) {
    const metadata = await fetchMetadata(mapping.sourceItem, mapping.sourceNamespace);
    if (!hasPositionConfig(metadata)) {
      console.log(
        `skip ${mapping.sourceNamespace}:${mapping.sourceItem} -> ${mapping.targetEquipment} (no position)`
      );
      continue;
    }

    const targetMetadata = {
      value: "v1",
      config: {
        x: String(metadata.config.x),
        y: String(metadata.config.y),
      },
    };

    if (!plannedWrites.has(mapping.targetEquipment)) {
      plannedWrites.set(mapping.targetEquipment, targetMetadata);
    }
    console.log(
      `${mode} ${mapping.sourceNamespace}:${mapping.sourceItem} -> ${TARGET_NAMESPACE}:${mapping.targetEquipment} ${JSON.stringify(
        targetMetadata.config
      )}`
    );
  }

  if (mode !== "apply") {
    console.log(`dry-run complete; ${plannedWrites.size} equipment metadata writes planned`);
    return;
  }

  for (const [itemName, metadata] of plannedWrites) {
    await putMetadata(itemName, metadata);
  }
  console.log(`apply complete; ${plannedWrites.size} equipment metadata entries written`);
};

migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
