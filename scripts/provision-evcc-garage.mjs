import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import process from "node:process";

const LOADPOINT_UID = "evcc:loadpoint:a60ed4e797:garage";
const REPEATING_PLAN_UID = "evcc:plan:a60ed4e797:CAD5407F5A";
const BATTERY_UID = "evcc:battery:a60ed4e797:byd-hvs";
const SITE_UID = "evcc:site:a60ed4e797:site";

const ITEM_DEFINITIONS = [
  {
    name: "EVCC_Garage",
    type: "Group",
    label: "EVCC Garage",
    category: "if:mdi:ev-station",
    groupNames: ["Garage"],
    tags: ["EVSE"],
  },
  {
    name: "EVCC_Garage_Connected",
    type: "Switch",
    label: "EVCC Garage verbunden",
    groupNames: ["EVCC_Garage"],
    tags: ["Status", "Presence"],
    channel: `${LOADPOINT_UID}:loadpoint-connected`,
  },
  {
    name: "EVCC_Garage_Charging",
    type: "Switch",
    label: "EVCC Garage lädt",
    groupNames: ["EVCC_Garage"],
    tags: ["Status", "Energy"],
    channel: `${LOADPOINT_UID}:loadpoint-charging`,
  },
  {
    name: "EVCC_Garage_Mode",
    type: "String",
    label: "EVCC Garage Modus",
    groupNames: ["EVCC_Garage"],
    tags: ["Control"],
    channel: `${LOADPOINT_UID}:loadpoint-mode`,
  },
  {
    name: "EVCC_Garage_LimitSoC",
    type: "Number:Dimensionless",
    label: "EVCC Garage Ladelimit",
    category: "batterylevel",
    groupNames: ["EVCC_Garage"],
    tags: ["Control", "Level"],
    channel: `${LOADPOINT_UID}:loadpoint-limit-soc`,
  },
  {
    name: "EVCC_Garage_VehicleSoC",
    type: "Number:Dimensionless",
    label: "EVCC Garage Fahrzeug SoC",
    category: "batterylevel",
    groupNames: ["EVCC_Garage"],
    tags: ["Measurement", "Level"],
    channel: `${LOADPOINT_UID}:loadpoint-vehicle-soc`,
  },
  {
    name: "EVCC_Garage_VehicleRange",
    type: "Number:Length",
    label: "EVCC Garage Reichweite",
    groupNames: ["EVCC_Garage"],
    tags: ["Measurement"],
    channel: `${LOADPOINT_UID}:loadpoint-vehicle-range`,
  },
  {
    name: "EVCC_Garage_VehicleName",
    type: "String",
    label: "EVCC Garage Fahrzeug Name",
    groupNames: ["EVCC_Garage"],
    tags: ["Status"],
    channel: `${LOADPOINT_UID}:loadpoint-vehicle-name`,
  },
  {
    name: "EVCC_Garage_VehicleTitle",
    type: "String",
    label: "EVCC Garage Fahrzeug",
    groupNames: ["EVCC_Garage"],
    tags: ["Status"],
    channel: `${LOADPOINT_UID}:loadpoint-vehicle-title`,
  },
  {
    name: "EVCC_Garage_ActivePhases",
    type: "Number",
    label: "EVCC Garage aktive Phasen",
    groupNames: ["EVCC_Garage"],
    tags: ["Status"],
    channel: `${LOADPOINT_UID}:loadpoint-phases-active`,
  },
  {
    name: "EVCC_Garage_ChargePower",
    type: "Number:Power",
    label: "EVCC Garage Ladeleistung",
    category: "energy",
    groupNames: ["EVCC_Garage"],
    tags: ["Measurement", "Power"],
    channel: `${LOADPOINT_UID}:loadpoint-charge-power`,
  },
  {
    name: "EVCC_Garage_EffectiveLimitSoC",
    type: "Number:Dimensionless",
    label: "EVCC Garage aktives Ladelimit",
    category: "batterylevel",
    groupNames: ["EVCC_Garage"],
    tags: ["Status", "Level"],
    channel: `${LOADPOINT_UID}:loadpoint-effective-limit-soc`,
  },
  {
    name: "EVCC_Garage_EffectivePlanId",
    type: "Number",
    label: "EVCC Garage aktiver Ladeplan",
    groupNames: ["EVCC_Garage"],
    tags: ["Status"],
    channel: `${LOADPOINT_UID}:loadpoint-effective-plan-id`,
  },
  {
    name: "EVCC_Garage_EffectivePlanSoC",
    type: "Number:Dimensionless",
    label: "EVCC Garage aktiver Ladeplan SoC",
    category: "batterylevel",
    groupNames: ["EVCC_Garage"],
    tags: ["Status", "Level"],
    channel: `${LOADPOINT_UID}:loadpoint-effective-plan-soc`,
  },
  {
    name: "EVCC_Garage_EffectivePlanTime",
    type: "DateTime",
    label: "EVCC Garage aktiver Ladeplan Zeit",
    groupNames: ["EVCC_Garage"],
    tags: ["Status"],
    channel: `${LOADPOINT_UID}:loadpoint-effective-plan-time`,
  },
  {
    name: "EVCC_EV6_Repeating_Plan_1_Active",
    type: "Switch",
    label: "EVCC EV6 Wiederholplan 1 aktiv",
    groupNames: ["EVCC_Garage"],
    tags: ["Control"],
    channel: `${REPEATING_PLAN_UID}:plan-active`,
  },
  {
    name: "EVCC_Battery_Power",
    type: "Number:Power",
    label: "EVCC Batterie Leistung",
    category: "energy",
    groupNames: ["EVCC_Garage"],
    tags: ["Measurement", "Power"],
    channel: `${BATTERY_UID}:battery-power`,
  },
  {
    name: "EVCC_Battery_SoC",
    type: "Number:Dimensionless",
    label: "EVCC Batterie SoC",
    category: "batterylevel",
    groupNames: ["EVCC_Garage"],
    tags: ["Measurement", "Level"],
    channel: `${BATTERY_UID}:battery-soc`,
  },
  {
    name: "EVCC_Battery_Title",
    type: "String",
    label: "EVCC Batterie",
    groupNames: ["EVCC_Garage"],
    tags: ["Status"],
    channel: `${BATTERY_UID}:battery-title`,
  },
  {
    name: "EVCC_Site_PrioritySoC",
    type: "Number:Dimensionless",
    label: "EVCC Batterie Priorität SoC",
    category: "batterylevel",
    groupNames: ["EVCC_Garage"],
    tags: ["Status", "Level"],
    channel: `${SITE_UID}:site-priority-soc`,
  },
];

const readEnvFile = () => {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return {};
  }

  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        return [key, value];
      })
  );
};

const fileEnv = readEnvFile();
const env = { ...fileEnv, ...process.env };
const protocol = (env.VITE_OPENHAB_PROTOCOL || "http").toLowerCase();
const host = env.VITE_OPENHAB_HOST || "localhost";
const port = env.VITE_OPENHAB_PORT || (protocol === "https" ? "9443" : "8080");
const insecure = env.VITE_OPENHAB_INSECURE === "true";
const apiToken = env.VITE_OPENHAB_API_TOKEN;
const baseUrl = `${protocol}://${host}:${port}/rest`;

const request = (method, pathname, body) =>
  new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}${pathname}`);
    const payload = body === undefined ? null : JSON.stringify(body);
    const transport = url.protocol === "https:" ? https : http;
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      rejectUnauthorized: !insecure,
      headers: {
        Accept: "application/json",
        ...(payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            }
          : {}),
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
    };

    const req = transport.request(options, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const parsedBody = data
          ? (() => {
              try {
                return JSON.parse(data);
              } catch {
                return data;
              }
            })()
          : null;
        resolve({ statusCode: res.statusCode ?? 0, body: parsedBody });
      });
    });

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });

const encode = (value) => encodeURIComponent(value);

const itemPayload = (definition) => ({
  type: definition.type,
  name: definition.name,
  label: definition.label,
  category: definition.category ?? "",
  groupNames: definition.groupNames,
  tags: definition.tags,
});

const ensureItem = async (definition) => {
  const existing = await request("GET", `/items/${encode(definition.name)}`);
  if (existing.statusCode === 200) {
    console.log(`item exists ${definition.name}`);
    return;
  }
  if (existing.statusCode !== 404) {
    throw new Error(`GET item ${definition.name} failed with ${existing.statusCode}`);
  }

  const created = await request(
    "PUT",
    `/items/${encode(definition.name)}`,
    itemPayload(definition)
  );
  if (![200, 201, 204].includes(created.statusCode)) {
    throw new Error(`PUT item ${definition.name} failed with ${created.statusCode}`);
  }
  console.log(`item created ${definition.name}`);
};

const ensureLink = async (definition) => {
  if (!definition.channel) {
    return;
  }

  const pathname = `/links/${encode(definition.name)}/${encode(definition.channel)}`;
  const existing = await request("GET", pathname);
  if (existing.statusCode === 200) {
    console.log(`link exists ${definition.name} -> ${definition.channel}`);
    return;
  }
  if (existing.statusCode !== 404) {
    throw new Error(
      `GET link ${definition.name} -> ${definition.channel} failed with ${existing.statusCode}`
    );
  }

  const created = await request("PUT", pathname, {
    itemName: definition.name,
    channelUID: definition.channel,
    configuration: {},
  });
  if (![200, 201, 204].includes(created.statusCode)) {
    throw new Error(
      `PUT link ${definition.name} -> ${definition.channel} failed with ${created.statusCode}`
    );
  }
  console.log(`link created ${definition.name} -> ${definition.channel}`);
};

const verify = async () => {
  const missingItems = [];
  const missingLinks = [];

  for (const definition of ITEM_DEFINITIONS) {
    const item = await request("GET", `/items/${encode(definition.name)}`);
    if (item.statusCode !== 200) {
      missingItems.push(definition.name);
    }

    if (definition.channel) {
      const link = await request(
        "GET",
        `/links/${encode(definition.name)}/${encode(definition.channel)}`
      );
      if (link.statusCode !== 200) {
        missingLinks.push(`${definition.name} -> ${definition.channel}`);
      }
    }
  }

  if (missingItems.length > 0 || missingLinks.length > 0) {
    throw new Error(
      `verification failed: missing items ${missingItems.join(", ") || "-"}, missing links ${
        missingLinks.join(", ") || "-"
      }`
    );
  }
};

for (const definition of ITEM_DEFINITIONS) {
  await ensureItem(definition);
}
for (const definition of ITEM_DEFINITIONS) {
  await ensureLink(definition);
}
await verify();

console.log("EVCC Garage provisioning complete");
