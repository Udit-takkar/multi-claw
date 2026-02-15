const APOLLO_SEARCH_URL = "https://api.apollo.io/api/v1/mixed_people/api_search";

interface ApolloSearchParams {
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  domain?: string;
  organization_name?: string;
  linkedin_url?: string;
}

interface ApolloEmployment {
  id: string;
  organization_name: string;
  title: string;
  current: boolean;
  start_date: string | null;
  end_date: string | null;
}

interface ApolloOrganization {
  id: string;
  name: string;
  website_url: string | null;
  linkedin_url: string | null;
  primary_domain: string | null;
  industry: string | null;
  estimated_num_employees: number | null;
  founded_year: number | null;
  annual_revenue: number | null;
  total_funding: number | null;
}

export interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string | null;
  headline: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  facebook_url: string | null;
  state: string | null;
  city: string | null;
  country: string | null;
  seniority: string | null;
  departments: string[];
  subdepartments: string[];
  functions: string[];
  is_likely_to_engage: boolean;
  organization_id: string | null;
  organization: ApolloOrganization | null;
  employment_history: ApolloEmployment[];
}

interface ApolloSearchResponse {
  people: ApolloPerson[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

const MOCK_DATA: Record<string, ApolloPerson> = {
  "tim@apple.com": {
    id: "mock_tim_cook_001",
    first_name: "Tim",
    last_name: "Cook",
    name: "Tim Cook",
    title: "Chief Executive Officer",
    headline: "CEO at Apple. Leading the world's most innovative company.",
    linkedin_url: "https://www.linkedin.com/in/timcook",
    photo_url: "https://media.licdn.com/dms/image/v2/D5603AQFR3gMBFp4cZQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1719009498409",
    twitter_url: "https://twitter.com/tim_cook",
    github_url: null,
    facebook_url: null,
    state: "California",
    city: "Cupertino",
    country: "United States",
    seniority: "c_suite",
    departments: ["C-Suite"],
    subdepartments: ["Executive"],
    functions: ["executive_management"],
    is_likely_to_engage: true,
    organization_id: "mock_apple_001",
    organization: {
      id: "mock_apple_001",
      name: "Apple",
      website_url: "https://apple.com",
      linkedin_url: "https://www.linkedin.com/company/apple",
      primary_domain: "apple.com",
      industry: "Consumer Electronics",
      estimated_num_employees: 164000,
      founded_year: 1976,
      annual_revenue: 383000000000,
      total_funding: 0,
    },
    employment_history: [
      {
        id: "emp_001",
        organization_name: "Apple",
        title: "Chief Executive Officer",
        current: true,
        start_date: "2011-08-01",
        end_date: null,
      },
      {
        id: "emp_002",
        organization_name: "Apple",
        title: "Chief Operating Officer",
        current: false,
        start_date: "2007-01-01",
        end_date: "2011-08-01",
      },
      {
        id: "emp_003",
        organization_name: "Compaq",
        title: "Vice President of Corporate Materials",
        current: false,
        start_date: "1997-01-01",
        end_date: "1998-03-01",
      },
      {
        id: "emp_004",
        organization_name: "IBM",
        title: "Director of North American Fulfillment",
        current: false,
        start_date: "1982-01-01",
        end_date: "1994-01-01",
      },
    ],
  },
  "satya@microsoft.com": {
    id: "mock_satya_001",
    first_name: "Satya",
    last_name: "Nadella",
    name: "Satya Nadella",
    title: "Chairman and Chief Executive Officer",
    headline: "Chairman and CEO at Microsoft",
    linkedin_url: "https://www.linkedin.com/in/satyanadella",
    photo_url: null,
    twitter_url: "https://twitter.com/sataborella",
    github_url: null,
    facebook_url: null,
    state: "Washington",
    city: "Redmond",
    country: "United States",
    seniority: "c_suite",
    departments: ["C-Suite"],
    subdepartments: ["Executive"],
    functions: ["executive_management"],
    is_likely_to_engage: true,
    organization_id: "mock_msft_001",
    organization: {
      id: "mock_msft_001",
      name: "Microsoft",
      website_url: "https://microsoft.com",
      linkedin_url: "https://www.linkedin.com/company/microsoft",
      primary_domain: "microsoft.com",
      industry: "Computer Software",
      estimated_num_employees: 221000,
      founded_year: 1975,
      annual_revenue: 245000000000,
      total_funding: 1000000,
    },
    employment_history: [
      {
        id: "emp_010",
        organization_name: "Microsoft",
        title: "Chairman and Chief Executive Officer",
        current: true,
        start_date: "2014-02-01",
        end_date: null,
      },
      {
        id: "emp_011",
        organization_name: "Microsoft",
        title: "EVP, Cloud and Enterprise",
        current: false,
        start_date: "2011-01-01",
        end_date: "2014-02-01",
      },
    ],
  },
};

function getMockPerson(params: ApolloSearchParams): ApolloPerson | null {
  if (params.email && MOCK_DATA[params.email]) {
    return MOCK_DATA[params.email];
  }

  const domain = params.domain || params.email?.split("@")[1];
  const name = params.name || [params.first_name, params.last_name].filter(Boolean).join(" ");

  return {
    id: `mock_${Date.now()}`,
    first_name: params.first_name || name.split(" ")[0] || "Unknown",
    last_name: params.last_name || name.split(" ").slice(1).join(" ") || "",
    name: name || "Unknown",
    title: "Director of Operations",
    headline: `Director of Operations at ${domain || "Company"}`,
    linkedin_url: null,
    photo_url: null,
    twitter_url: null,
    github_url: null,
    facebook_url: null,
    state: "California",
    city: "San Francisco",
    country: "United States",
    seniority: "director",
    departments: ["Operations"],
    subdepartments: [],
    functions: ["operations"],
    is_likely_to_engage: false,
    organization_id: `mock_org_${Date.now()}`,
    organization: domain
      ? {
          id: `mock_org_${Date.now()}`,
          name: domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1),
          website_url: `https://${domain}`,
          linkedin_url: null,
          primary_domain: domain,
          industry: "Technology",
          estimated_num_employees: 150,
          founded_year: 2015,
          annual_revenue: null,
          total_funding: 25000000,
        }
      : null,
    employment_history: [
      {
        id: `emp_${Date.now()}`,
        organization_name: domain?.split(".")[0] || "Company",
        title: "Director of Operations",
        current: true,
        start_date: "2022-06-01",
        end_date: null,
      },
    ],
  };
}

export async function enrichWithApollo(
  params: ApolloSearchParams
): Promise<ApolloPerson | null> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey || apiKey === "mock") {
    console.log("[Apollo Mock] Returning mock data for:", params.email || params.name);
    return getMockPerson(params);
  }

  const body: Record<string, unknown> = {
    page: 1,
    per_page: 1,
  };
  if (params.email) body.email = params.email;
  if (params.first_name) body.first_name = params.first_name;
  if (params.last_name) body.last_name = params.last_name;
  if (params.name) body.name = params.name;
  if (params.domain) body.domain = params.domain;
  if (params.organization_name) body.organization_name = params.organization_name;
  if (params.linkedin_url) body.linkedin_url = params.linkedin_url;

  const response = await fetch(APOLLO_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 429) {
    throw new Error("Apollo API rate limit exceeded. Retry later.");
  }

  if (response.status === 401) {
    throw new Error("Apollo API key is invalid.");
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Apollo API error (${response.status}): ${errorBody}`);
  }

  const data: ApolloSearchResponse = await response.json();
  return data.people?.[0] ?? null;
}
