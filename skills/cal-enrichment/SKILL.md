---
name: cal-enrichment
description: Enrich Cal.com booking attendees with Apollo.io People Search API (free tier)
version: 2.0.0
triggers:
  - webhook
  - cron
tools:
  - bash
env:
  - APOLLO_API_KEY
---

# Cal.com Lead Enrichment Skill (Apollo.io)

You are helping enrich a Cal.com booking attendee using the Apollo.io People Search API (free tier, no credits consumed).

## When Triggered

You receive a booking with attendee information (name, email).

## Steps

1. **Extract contact info** from the booking data (email, first name, last name, domain)

2. **Call Apollo People Search API** (free tier, no credits):

```bash
curl -X POST "https://api.apollo.io/api/v1/mixed_people/api_search" \
  -H "x-api-key: $APOLLO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"<attendee_email>","first_name":"<first>","last_name":"<last>","domain":"<company_domain>","page":1,"per_page":1}'
```

Apollo returns: person profile, title, seniority, LinkedIn URL, company info (name, size, industry, funding, revenue), employment history, and engagement likelihood. Note: emails and phone numbers are excluded from this free endpoint (not needed — Cal.com already provides the email).

3. **Extract sales signals** from Apollo data:
   - Recent job changes (new decision maker)
   - Company funding level
   - Seniority (c_suite, vp, director = high value)
   - `is_likely_to_engage` flag
   - Employee count growth

4. **Calculate lead score** (0-100) using Apollo signals:
   - LinkedIn profile found: +10
   - Company data found: +10
   - Business email (not personal): +10
   - Likely to engage: +15
   - Sales signals: +5 each (max +15)
   - Seniority bonus: c_suite +15, vp +12, director +10, manager +5
   - Funding > $50M: +5, > $10M: +3
   - Employees > 200: +5, > 50: +3

5. **Store results** in Convex:

```bash
npx convex run enrichedLeads:create '{
  "bookingId": "<booking_id>",
  "contactEmail": "<email>",
  "contactName": "<name>",
  "apolloId": "<apollo_person_id>",
  "photoUrl": "<photo_url>",
  "linkedinUrl": "<linkedin_url>",
  "headline": "<headline>",
  "title": "<job_title>",
  "seniority": "<seniority_level>",
  "location": "<city, state, country>",
  "companyName": "<company>",
  "companySize": "<1-10|11-50|51-200|201-1000|1001-5000|5000+>",
  "companyWebsite": "<website>",
  "companyLinkedinUrl": "<company_linkedin>",
  "industry": "<industry>",
  "fundingStage": "<Pre-Seed/Seed|Series A|B|C|D+>",
  "estimatedEmployees": <number>,
  "totalFunding": <number>,
  "foundedYear": <number>,
  "twitterUrl": "<twitter>",
  "githubUrl": "<github>",
  "employmentHistory": [{"organizationName":"...","title":"...","current":true}],
  "salesSignals": ["signal1", "signal2"],
  "isLikelyToEngage": true,
  "leadScore": <0-100>
}'
```

6. **Post activity**:

```bash
npx convex run activities:create '{
  "type": "booking_enriched",
  "agentId": "<scout_agent_id>",
  "message": "Enriched lead: <name> (<title> at <company>). Lead score: <score>/100. Source: Apollo.io",
  "createdAt": <timestamp>
}'
```

## Rate Limits
- Apollo API: 600 calls/hour
- If rate limited (429), wait and retry on next heartbeat

## Quality Standards
- All data sourced from Apollo.io API
- Lead scores include reasoning based on specific signals
- Flag when Apollo returns no match (score will be lower)
