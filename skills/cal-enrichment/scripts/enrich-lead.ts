import { enrichWithApollo, type ApolloPerson } from "./apollo-client";

interface BookingData {
  bookingId: string;
  attendeeEmail: string;
  attendeeName: string;
}

interface EnrichedLead {
  bookingId: string;
  contactEmail: string;
  contactName: string;
  apolloId?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  headline?: string;
  title?: string;
  seniority?: string;
  location?: string;
  companyName?: string;
  companySize?: string;
  companyWebsite?: string;
  companyLinkedinUrl?: string;
  industry?: string;
  fundingStage?: string;
  estimatedEmployees?: number;
  annualRevenue?: number;
  totalFunding?: number;
  foundedYear?: number;
  twitterUrl?: string;
  githubUrl?: string;
  employmentHistory: Array<{
    organizationName: string;
    title: string;
    current: boolean;
    startDate?: string;
    endDate?: string;
  }>;
  salesSignals: string[];
  isLikelyToEngage?: boolean;
  leadScore: number;
  enrichedAt: number;
}

export async function enrichLead(booking: BookingData): Promise<EnrichedLead> {
  const [firstName, ...lastParts] = booking.attendeeName.split(" ");
  const lastName = lastParts.join(" ");
  const emailDomain = booking.attendeeEmail.split("@")[1];
  const isPersonalEmail = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"].includes(emailDomain);

  const person = await enrichWithApollo({
    email: booking.attendeeEmail,
    first_name: firstName,
    last_name: lastName || undefined,
    domain: isPersonalEmail ? undefined : emailDomain,
  });

  const salesSignals = extractSalesSignals(person);
  const employmentHistory = (person?.employment_history || []).map((e) => ({
    organizationName: e.organization_name,
    title: e.title,
    current: e.current,
    startDate: e.start_date || undefined,
    endDate: e.end_date || undefined,
  }));

  const org = person?.organization;
  const fundingStage = deriveFundingStage(org?.total_funding);

  const leadScore = calculateLeadScore({
    hasLinkedin: !!person?.linkedin_url,
    hasCompanyInfo: !!org,
    isPersonalEmail,
    seniority: person?.seniority || "unknown",
    isLikelyToEngage: person?.is_likely_to_engage || false,
    totalFunding: org?.total_funding || null,
    employeeCount: org?.estimated_num_employees || null,
    salesSignalCount: salesSignals.length,
  });

  const location = [person?.city, person?.state, person?.country]
    .filter(Boolean)
    .join(", ") || undefined;

  return {
    bookingId: booking.bookingId,
    contactEmail: booking.attendeeEmail,
    contactName: booking.attendeeName,
    apolloId: person?.id,
    photoUrl: person?.photo_url || undefined,
    linkedinUrl: person?.linkedin_url || undefined,
    headline: person?.headline || undefined,
    title: person?.title || undefined,
    seniority: person?.seniority || undefined,
    location,
    companyName: org?.name || undefined,
    companySize: org?.estimated_num_employees
      ? categorizeCompanySize(org.estimated_num_employees)
      : undefined,
    companyWebsite: org?.website_url || undefined,
    companyLinkedinUrl: org?.linkedin_url || undefined,
    industry: org?.industry || undefined,
    fundingStage,
    estimatedEmployees: org?.estimated_num_employees || undefined,
    annualRevenue: org?.annual_revenue || undefined,
    totalFunding: org?.total_funding || undefined,
    foundedYear: org?.founded_year || undefined,
    twitterUrl: person?.twitter_url || undefined,
    githubUrl: person?.github_url || undefined,
    employmentHistory,
    salesSignals,
    isLikelyToEngage: person?.is_likely_to_engage,
    leadScore,
    enrichedAt: Date.now(),
  };
}

function extractSalesSignals(person: ApolloPerson | null): string[] {
  const signals: string[] = [];
  if (!person) return signals;

  if (person.is_likely_to_engage) {
    signals.push("High engagement likelihood (Apollo signal)");
  }

  const currentJob = person.employment_history?.find((e) => e.current);
  const previousJobs = person.employment_history?.filter((e) => !e.current) || [];
  if (currentJob && previousJobs.length > 0) {
    const mostRecent = previousJobs[0];
    if (mostRecent?.end_date) {
      const endDate = new Date(mostRecent.end_date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (endDate > threeMonthsAgo) {
        signals.push("Recent job change — new decision maker");
      }
    }
  }

  const org = person.organization;
  if (org?.total_funding && org.total_funding > 10_000_000) {
    signals.push(`Funded: $${(org.total_funding / 1_000_000).toFixed(0)}M total funding`);
  }

  if (org?.estimated_num_employees && org.estimated_num_employees > 50) {
    signals.push(`Growing company: ${org.estimated_num_employees}+ employees`);
  }

  const seniority = person.seniority?.toLowerCase();
  if (seniority === "c_suite" || seniority === "vp" || seniority === "director") {
    signals.push(`Senior decision maker: ${person.title}`);
  }

  return signals;
}

function calculateLeadScore(signals: {
  hasLinkedin: boolean;
  hasCompanyInfo: boolean;
  isPersonalEmail: boolean;
  seniority: string;
  isLikelyToEngage: boolean;
  totalFunding: number | null;
  employeeCount: number | null;
  salesSignalCount: number;
}): number {
  let score = 20;

  if (signals.hasLinkedin) score += 10;
  if (signals.hasCompanyInfo) score += 10;
  if (!signals.isPersonalEmail) score += 10;
  if (signals.isLikelyToEngage) score += 15;

  score += Math.min(signals.salesSignalCount * 5, 15);

  const seniorityBonus: Record<string, number> = {
    c_suite: 15,
    vp: 12,
    director: 10,
    manager: 5,
    senior: 3,
    entry: 0,
    unknown: 0,
  };
  score += seniorityBonus[signals.seniority.toLowerCase()] || 0;

  if (signals.totalFunding) {
    if (signals.totalFunding > 50_000_000) score += 5;
    else if (signals.totalFunding > 10_000_000) score += 3;
  }

  if (signals.employeeCount) {
    if (signals.employeeCount > 200) score += 5;
    else if (signals.employeeCount > 50) score += 3;
  }

  return Math.min(score, 100);
}

function categorizeCompanySize(employees: number): string {
  if (employees <= 10) return "1-10";
  if (employees <= 50) return "11-50";
  if (employees <= 200) return "51-200";
  if (employees <= 1000) return "201-1000";
  if (employees <= 5000) return "1001-5000";
  return "5000+";
}

function deriveFundingStage(totalFunding: number | null | undefined): string | undefined {
  if (!totalFunding) return undefined;
  if (totalFunding < 2_000_000) return "Pre-Seed/Seed";
  if (totalFunding < 15_000_000) return "Series A";
  if (totalFunding < 50_000_000) return "Series B";
  if (totalFunding < 150_000_000) return "Series C";
  return "Series D+";
}
