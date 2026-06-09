/**
 * BMET CSV importer.
 *
 * Imports/updates recruiting agencies from a CSV export of the official BMET
 * licensed-agency list. Existing agencies (matched by BMET license number) are
 * updated; new ones are created. This is how real data replaces the demo seed.
 *
 * Usage:
 *   npm run import:bmet -- ./data/sample-bmet.csv
 *
 * Expected CSV columns (header row required, order-independent):
 *   bmetLicenseNumber, agencyName, ownerName, phonePrimary, phoneSecondary,
 *   email, websiteUrl, headOfficeLocation, officeDivision,
 *   licenseIssueDate (YYYY-MM-DD), licenseExpiryDate (YYYY-MM-DD),
 *   licenseStatus (active|expired|suspended|revoked),
 *   destinationCountries (semicolon-separated, e.g. "Saudi Arabia;UAE")
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Minimal RFC-4180-ish CSV parser (handles quoted fields + embedded commas).
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((f) => f.trim() !== "")) rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = (r[idx] ?? "").trim()));
    return obj;
  });
}

function toDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npm run import:bmet -- <path-to-csv>");
    process.exit(1);
  }
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const text = fs.readFileSync(fullPath, "utf-8");
  const records = parseCsv(text);
  console.log(`Parsed ${records.length} rows from ${file}`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const rec of records) {
    const license = rec.bmetLicenseNumber || rec.license || rec.licenseNumber;
    const name = rec.agencyName || rec.name;
    if (!license || !name) {
      skipped++;
      continue;
    }

    const destinations = (rec.destinationCountries || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    const data = {
      agencyName: name,
      ownerName: rec.ownerName || null,
      phonePrimary: rec.phonePrimary || "unknown",
      phoneSecondary: rec.phoneSecondary || null,
      email: rec.email || null,
      websiteUrl: rec.websiteUrl || null,
      headOfficeLocation: rec.headOfficeLocation || null,
      officeDivision: rec.officeDivision || null,
      licenseIssueDate: toDate(rec.licenseIssueDate),
      licenseExpiryDate: toDate(rec.licenseExpiryDate),
      licenseStatus: (rec.licenseStatus || "active").toLowerCase(),
      destinationCountries: JSON.stringify(destinations),
      lastUpdatedFromBmet: new Date(),
    };

    const existing = await prisma.agency.findUnique({
      where: { bmetLicenseNumber: license },
    });

    if (existing) {
      await prisma.agency.update({ where: { bmetLicenseNumber: license }, data });
      updated++;
    } else {
      await prisma.agency.create({ data: { bmetLicenseNumber: license, ...data } });
      created++;
    }
  }

  console.log(`Import complete. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
