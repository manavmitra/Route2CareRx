import { readFileSync } from "fs";
import { resolve } from "path";

export function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const envPath = resolve(process.cwd(), name);
    try {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        let key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        // Fix malformed keys like DIRECT_CONNECTION_STRING+postgresql://...
        if (key.includes("+")) {
          const parts = key.split("+");
          key = parts[0];
          if (!value && parts[1]) value = parts.slice(1).join("+");
        }
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      // file may not exist
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.PROJECT_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.PROJECT_URL;
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
  }
}

export function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

export function parseDelimited(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0]
    .split(delimiter)
    .map((h) => h.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values =
      delimiter === "\t"
        ? lines[i].split("\t")
        : parseCSVLine(lines[i]);
    if (values.length < headers.length - 1) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim().replace(/^"|"$/g, "");
    });
    rows.push(row);
  }
  return rows;
}
