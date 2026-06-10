import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// NOTE: This sample data is illustrative for the demo. In production these
// records would be synced from BMET's official licensed-agency list. Agency
// names below are fictional and used only to demonstrate the system.

async function main() {
  console.log("Seeding Probashi Shield database...");

  // Clear existing data (order matters for FKs)
  await prisma.auditLog.deleteMany();
  await prisma.blacklistHistory.deleteMany();
  await prisma.verificationLog.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.destinationCountry.deleteMany();

  // ---- Destination countries ----
  const destinations = [
    {
      countryName: "Saudi Arabia",
      countryCode: "SA",
      officialRecruitmentFee: 165000,
      salaryRangeLow: 22000,
      salaryRangeHigh: 45000,
      commonJobTypes: JSON.stringify(["Construction", "Driver", "Cleaner", "Domestic worker", "Factory"]),
      embassyName: "Embassy of Bangladesh, Riyadh",
      embassyPhone: "+966-11-4198146",
      embassyWebsite: "https://riyadh.mofa.gov.bd",
      redFlagsSpecific: "Beware of 'free visa' offers - they are illegal and leave you without legal status.",
      avgProcessingDays: 45,
    },
    {
      countryName: "Malaysia",
      countryCode: "MY",
      officialRecruitmentFee: 78990,
      salaryRangeLow: 30000,
      salaryRangeHigh: 55000,
      commonJobTypes: JSON.stringify(["Plantation", "Manufacturing", "Construction", "Services"]),
      embassyName: "High Commission of Bangladesh, Kuala Lumpur",
      embassyPhone: "+60-3-21420412",
      embassyWebsite: "https://kualalumpur.mofa.gov.bd",
      redFlagsSpecific: "Government fixed cost is BDT 78,990. Anyone asking more is overcharging illegally.",
      avgProcessingDays: 60,
    },
    {
      countryName: "UAE",
      countryCode: "AE",
      officialRecruitmentFee: 120000,
      salaryRangeLow: 25000,
      salaryRangeHigh: 60000,
      commonJobTypes: JSON.stringify(["Hospitality", "Construction", "Security", "Retail", "Driver"]),
      embassyName: "Embassy of Bangladesh, Abu Dhabi",
      embassyPhone: "+971-2-4468899",
      embassyWebsite: "https://abudhabi.mofa.gov.bd",
      redFlagsSpecific: "Visit visas cannot be converted to work visas easily. Confirm visa type before paying.",
      avgProcessingDays: 40,
    },
    {
      countryName: "Qatar",
      countryCode: "QA",
      officialRecruitmentFee: 110000,
      salaryRangeLow: 24000,
      salaryRangeHigh: 50000,
      commonJobTypes: JSON.stringify(["Construction", "Hospitality", "Security", "Driver"]),
      embassyName: "Embassy of Bangladesh, Doha",
      embassyPhone: "+974-44671543",
      embassyWebsite: "https://doha.mofa.gov.bd",
      redFlagsSpecific: "Confirm your employer name matches your contract before departure.",
      avgProcessingDays: 50,
    },
    {
      countryName: "Singapore",
      countryCode: "SG",
      officialRecruitmentFee: 220000,
      salaryRangeLow: 45000,
      salaryRangeHigh: 90000,
      commonJobTypes: JSON.stringify(["Marine", "Construction", "Process / Shipyard"]),
      embassyName: "High Commission of Bangladesh, Singapore",
      embassyPhone: "+65-62550075",
      embassyWebsite: "https://singapore.mofa.gov.bd",
      redFlagsSpecific: "You must pass an SEC (Skills Evaluation Certificate) test - genuine jobs require it.",
      avgProcessingDays: 75,
    },
  ];

  for (const d of destinations) {
    await prisma.destinationCountry.create({ data: d });
  }
  console.log(`  - ${destinations.length} destination countries`);

  // ---- Agencies ----
  const year = new Date().getFullYear();
  const mk = (y: number, m: number, d: number) => new Date(y, m - 1, d);

  const agencies = await Promise.all([
    // 1. Clean, active, premium-verified
    prisma.agency.create({
      data: {
        bmetLicenseNumber: "RL-1024",
        agencyName: "Al-Amin Overseas Recruitment Ltd.",
        ownerName: "Mohammad Al-Amin",
        phonePrimary: "01711000111",
        email: "info@alaminoverseas.example",
        websiteUrl: "https://alaminoverseas.example",
        headOfficeLocation: "Naya Paltan, Dhaka",
        officeDivision: "Dhaka",
        licenseIssueDate: mk(year - 4, 3, 12),
        licenseExpiryDate: mk(year + 2, 3, 11),
        licenseStatus: "active",
        destinationCountries: JSON.stringify(["Saudi Arabia", "UAE", "Qatar"]),
        isVerified: true,
        verificationBadge: "premium",
      },
    }),
    // 2. Clean, active, basic
    prisma.agency.create({
      data: {
        bmetLicenseNumber: "RL-2087",
        agencyName: "Meghna Manpower Services",
        ownerName: "Rina Akter",
        phonePrimary: "01811222333",
        email: "contact@meghnamanpower.example",
        headOfficeLocation: "Agrabad, Chattogram",
        officeDivision: "Chattogram",
        licenseIssueDate: mk(year - 2, 7, 1),
        licenseExpiryDate: mk(year + 3, 6, 30),
        licenseStatus: "active",
        destinationCountries: JSON.stringify(["Malaysia", "Singapore"]),
        isVerified: true,
        verificationBadge: "basic",
      },
    }),
    // 3. Active but has complaints (caution)
    prisma.agency.create({
      data: {
        bmetLicenseNumber: "RL-3391",
        agencyName: "Gulf Gateway International",
        ownerName: "Shahidul Islam",
        phonePrimary: "01911444555",
        headOfficeLocation: "Fakirapool, Dhaka",
        officeDivision: "Dhaka",
        licenseIssueDate: mk(year - 3, 1, 20),
        licenseExpiryDate: mk(year + 1, 1, 19),
        licenseStatus: "active",
        destinationCountries: JSON.stringify(["Saudi Arabia", "Qatar"]),
        verificationBadge: "none",
      },
    }),
    // 4. Expired license (danger)
    prisma.agency.create({
      data: {
        bmetLicenseNumber: "RL-4102",
        agencyName: "Probashi Bandhu Recruiting",
        ownerName: "Kamal Hossain",
        phonePrimary: "01611666777",
        headOfficeLocation: "Sylhet Sadar, Sylhet",
        officeDivision: "Sylhet",
        licenseIssueDate: mk(year - 6, 5, 5),
        licenseExpiryDate: mk(year - 1, 5, 4),
        licenseStatus: "expired",
        destinationCountries: JSON.stringify(["UAE"]),
        verificationBadge: "none",
      },
    }),
    // 5. Blacklisted (danger) - many complaints
    prisma.agency.create({
      data: {
        bmetLicenseNumber: "RL-5567",
        agencyName: "Dubai Dream Jobs Agency",
        ownerName: "Unknown",
        phonePrimary: "01511888999",
        headOfficeLocation: "Unverified address",
        officeDivision: "Dhaka",
        licenseIssueDate: mk(year - 5, 2, 2),
        licenseExpiryDate: mk(year + 1, 2, 1),
        licenseStatus: "suspended",
        destinationCountries: JSON.stringify(["UAE", "Saudi Arabia"]),
        blacklistStatus: "permanent_blacklist",
        blacklistReason: "Multiple verified cases of taking money for non-existent jobs.",
        verificationBadge: "none",
      },
    }),
  ]);
  console.log(`  - ${agencies.length} agencies`);

  // ---- Complaints ----
  const complaintsData = [
    {
      agencyId: agencies[2].id, // Gulf Gateway - caution
      reporterName: "Anonymous",
      reporterLocation: "Comilla",
      complaintType: "salary_wrong",
      description:
        "Was promised BDT 45,000/month in Saudi Arabia but actual salary is only BDT 22,000. Contract differed from what the agent showed.",
      amountLost: 50000,
      severityLevel: "high",
      status: "investigating",
      isVerified: false,
      trackingNumber: "PS-" + year + "-AB12CD",
    },
    {
      agencyId: agencies[2].id,
      reporterLocation: "Noakhali",
      complaintType: "job_mismatch",
      description: "Agent said factory job but on arrival it was hard construction labour in extreme heat.",
      amountLost: 0,
      severityLevel: "medium",
      status: "under_review",
      isVerified: false,
      trackingNumber: "PS-" + year + "-EF34GH",
    },
    {
      agencyId: agencies[4].id, // Dubai Dream Jobs - blacklisted
      reporterName: "Family of victim",
      reporterPhone: "01700000000",
      reporterLocation: "Tangail",
      complaintType: "money_fraud",
      description:
        "Paid BDT 4,20,000 for a UAE job. Agent stopped answering calls and office is now closed. We sold land for this.",
      amountLost: 420000,
      severityLevel: "critical",
      status: "verified_fraud",
      isVerified: true,
      trackingNumber: "PS-" + year + "-JK56LM",
    },
    {
      agencyId: agencies[4].id,
      reporterLocation: "Jamalpur",
      complaintType: "money_fraud",
      description: "Took 3.5 lakh taka, gave a fake visa. Immigration stopped me at the airport.",
      amountLost: 350000,
      severityLevel: "critical",
      status: "verified_fraud",
      isVerified: true,
      trackingNumber: "PS-" + year + "-NP78QR",
    },
    {
      agencyId: agencies[4].id,
      reporterLocation: "Kishoreganj",
      complaintType: "missing_contact",
      description: "Agent disappeared after taking advance of 1,50,000 taka.",
      amountLost: 150000,
      severityLevel: "critical",
      status: "verified_fraud",
      isVerified: true,
      trackingNumber: "PS-" + year + "-ST90UV",
    },
  ];

  for (const c of complaintsData) {
    await prisma.complaint.create({ data: c as any });
  }
  console.log(`  - ${complaintsData.length} complaints`);

  // Blacklist history for the blacklisted agency
  await prisma.blacklistHistory.create({
    data: {
      agencyId: agencies[4].id,
      reason: "Multiple verified cases of taking money for non-existent jobs.",
      action: "added",
    },
  });

  // ---- Users ----
  const adminPass = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@probashishield.gov.bd",
      name: "Ministry Admin",
      passwordHash: adminPass,
      userType: "super_admin",
      isVerified: true,
      emailVerified: true,
    },
  });

  const agencyPass = await bcrypt.hash("agency123", 10);
  await prisma.user.create({
    data: {
      email: "owner@alaminoverseas.example",
      name: "Mohammad Al-Amin",
      passwordHash: agencyPass,
      userType: "agency",
      isVerified: true,
      emailVerified: true,
      managedAgencyId: agencies[0].id,
    },
  });

  // Some sample verification logs to populate analytics
  for (let i = 0; i < 30; i++) {
    await prisma.verificationLog.create({
      data: {
        agencyId: agencies[i % agencies.length].id,
        searchQuery: agencies[i % agencies.length].agencyName,
        searchType: i % 3 === 0 ? "sms" : "by_name",
        channel: i % 3 === 0 ? "sms" : "web",
        resultFound: true,
      },
    });
  }

  console.log("Seed complete.");
  console.log("  Admin login:  admin@probashishield.gov.bd / admin123");
  console.log("  Agency login: owner@alaminoverseas.example / agency123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
