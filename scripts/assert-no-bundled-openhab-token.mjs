import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const envPath = join(repoRoot, ".env");
const distPath = join(repoRoot, "dist");

const parseEnvToken = (envContent) => {
  for (const line of envContent.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const match = /^VITE_OPENHAB_API_TOKEN\s*=\s*(.*)$/.exec(trimmedLine);
    if (!match) {
      continue;
    }

    let value = match[1].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value.trim();
  }

  return "";
};

const listFiles = (directory) => {
  const entries = readdirSync(directory);
  return entries.flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);
    return stats.isDirectory() ? listFiles(path) : [path];
  });
};

if (!existsSync(envPath)) {
  console.log("No .env file found; skipping openHAB token bundle check.");
  process.exit(0);
}

const token = parseEnvToken(readFileSync(envPath, "utf8"));
if (!token) {
  console.log("No VITE_OPENHAB_API_TOKEN in .env; skipping bundle check.");
  process.exit(0);
}

if (!existsSync(distPath)) {
  throw new Error("dist directory does not exist. Run the production build first.");
}

const encodedToken = Buffer.from(token, "utf8")
  .toString("base64")
  .replace(/=*$/, "");
const needles = [token, encodedToken].filter((value) => value.length > 0);
const matchingFiles = listFiles(distPath).filter((filePath) => {
  const content = readFileSync(filePath, "utf8");
  return needles.some((needle) => content.includes(needle));
});

if (matchingFiles.length > 0) {
  console.error(
    `openHAB token material was found in ${matchingFiles.length} built file(s).`
  );
  console.error("Production bundle check failed.");
  process.exit(1);
}

console.log("openHAB token bundle check passed.");
