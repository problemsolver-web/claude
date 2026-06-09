import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { config } from "../config";
import { computeRisk } from "../utils/helpers";

const router = Router();

const smsSchema = z.object({
  message: z.string().min(1),
  from: z.string().optional(),
});

// Core logic: take a raw SMS body, return the reply text.
async function handleSmsCommand(body: string): Promise<string> {
  const text = body.trim();
  const upper = text.toUpperCase();
  const hotline = config.ministryHotline;

  // HELP
  if (upper === "HELP" || upper === "MENU") {
    return [
      "PROBASHI SHIELD commands:",
      "VERIFY <agency name> - check an agent",
      "FEE <country> - official cost",
      "REPORT <agency> - report fraud",
      "TIPS - safety tips",
      `Ministry hotline: ${hotline}`,
    ].join("\n");
  }

  // TIPS
  if (upper === "TIPS") {
    return [
      "SAFETY TIPS:",
      "1. Only use BMET-licensed agencies.",
      "2. Never pay cash without receipt.",
      "3. Get the job contract in writing.",
      "4. Verify salary with FEE <country>.",
      `5. Report fraud to ${hotline}.`,
    ].join("\n");
  }

  // FEE <country>
  if (upper.startsWith("FEE")) {
    const country = text.substring(3).trim();
    if (!country) return "Send: FEE <country>. Example: FEE Saudi Arabia";
    const c = await prisma.destinationCountry.findFirst({
      where: { countryName: { contains: country } },
    });
    if (!c) return `No official data for "${country}". Send FEE with a country like Malaysia, Saudi Arabia, UAE.`;
    return [
      `${c.countryName} (official):`,
      `Govt fee: ${c.officialRecruitmentFee ? "BDT " + c.officialRecruitmentFee.toLocaleString() : "N/A"}`,
      `Salary: BDT ${c.salaryRangeLow?.toLocaleString() || "?"}-${c.salaryRangeHigh?.toLocaleString() || "?"}/mo`,
      "If asked for more, it may be FRAUD.",
    ].join("\n");
  }

  // REPORT <agency>
  if (upper.startsWith("REPORT")) {
    const name = text.substring(6).trim();
    return [
      `To report ${name || "an agent"}, call ${hotline}`,
      "or visit probashishield.app/report",
      "Keep receipts & messages as proof.",
    ].join("\n");
  }

  // VERIFY <agency or license>
  if (upper.startsWith("VERIFY")) {
    const query = text.substring(6).trim();
    if (!query) return "Send: VERIFY <agency name or license number>";
    return await verifyAgencyForSms(query, hotline);
  }

  // Fallback: treat whole message as a verify query
  return await verifyAgencyForSms(text, hotline);
}

async function verifyAgencyForSms(query: string, hotline: string): Promise<string> {
  const agency = await prisma.agency.findFirst({
    where: {
      OR: [
        { agencyName: { contains: query } },
        { bmetLicenseNumber: { contains: query } },
        { phonePrimary: { contains: query.replace(/\D/g, "") || "___none___" } },
      ],
    },
  });

  // log
  prisma.verificationLog
    .create({
      data: {
        agencyId: agency?.id ?? null,
        searchQuery: query,
        searchType: "sms",
        channel: "sms",
        resultFound: !!agency,
      },
    })
    .catch(() => undefined);

  if (!agency) {
    return [
      `"${query}" NOT FOUND in BMET licensed list.`,
      "Do NOT send money until verified.",
      `Call Ministry: ${hotline}`,
    ].join("\n");
  }

  const total = await prisma.complaint.count({ where: { agencyId: agency.id } });
  const verified = await prisma.complaint.count({
    where: { agencyId: agency.id, isVerified: true },
  });
  const risk = computeRisk({
    licenseStatus: agency.licenseStatus,
    blacklistStatus: agency.blacklistStatus,
    verifiedComplaints: verified,
    totalComplaints: total,
  });

  if (risk.level === "danger") {
    return [
      `${agency.agencyName} - ${risk.emoji} NOT SAFE`,
      agency.blacklistStatus !== "none"
        ? "BLACKLISTED by authorities."
        : `License: ${agency.licenseStatus.toUpperCase()}.`,
      total > 0 ? `${total} fraud report(s).` : "",
      `Do NOT send money. Call ${hotline}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (risk.level === "caution") {
    return [
      `${agency.agencyName} - ${risk.emoji} CAUTION`,
      `Licensed (#${agency.bmetLicenseNumber}) but ${total} report(s) filed.`,
      "Verify job offer & fees before paying.",
    ].join("\n");
  }

  return [
    `${agency.agencyName} - ${risk.emoji} VERIFIED`,
    `License #${agency.bmetLicenseNumber} active.`,
    agency.licenseExpiryDate
      ? `Valid till ${new Date(agency.licenseExpiryDate).getFullYear()}.`
      : "",
    "Still verify your job offer details.",
  ]
    .filter(Boolean)
    .join("\n");
}

// POST /api/v1/sms/verify -> used by the web SMS simulator AND can be wired to Twilio webhook
router.post(
  "/verify",
  asyncHandler(async (req, res) => {
    const { message } = smsSchema.parse(req.body);
    const reply = await handleSmsCommand(message);
    res.json({ reply });
  })
);

// POST /api/v1/sms/twilio-webhook -> TwiML response for real Twilio integration
router.post(
  "/twilio-webhook",
  asyncHandler(async (req, res) => {
    const body = String(req.body.Body || "");
    const reply = await handleSmsCommand(body);
    res.set("Content-Type", "text/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(reply)}</Message></Response>`);
  })
);

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default router;
