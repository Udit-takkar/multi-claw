# Multi-Claw: Cal.com Mission Control

Multi-agent system that adds AI-powered intelligence to Cal.com bookings. Four specialized agents handle lead enrichment, meeting prep, post-meeting analysis, and predictive analytics — all visible in a real-time Mission Control dashboard.

## Architecture

```
Cal.com Webhook ──► Convex (DB + HTTP) ──► Mission Control UI (React)
                         │
                    OpenClaw Gateway
                    ┌────┼────┬────┐
                    ▼    ▼    ▼    ▼
                 Scout Archer Scribe Oracle
```

**Cal.com handles:** confirmations, reminders, CRM logging, follow-up emails
**Agents handle:** AI research, strategic briefs, meeting intelligence, predictions

## Agents

| Agent | Role | Trigger |
|-------|------|---------|
| **Scout** | Lead Intelligence — enriches attendee profiles, scores leads 0-100 | BOOKING_CREATED |
| **Archer** | Meeting Strategist — generates strategic briefs with talking points | BOOKING_CREATED |
| **Scribe** | Post-Meeting Intel — extracts action items, buying signals, deal scoring | MEETING_ENDED |
| **Oracle** | Predictive Analytics — no-show risk, deal conversion probability | BOOKING_CREATED |

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Database:** Convex (real-time, serverless)
- **Agents:** OpenClaw (gateway + sessions + cron)
- **AI Model:** Anthropic Claude Sonnet 4.5 (via Claude Code credentials)
- **Enrichment:** Apollo.io People Search API (mock mode for demo)

## Prerequisites

- Node.js >= 22.12.0 (required by OpenClaw)
- pnpm
- OpenClaw CLI (`npm install -g openclaw`)
- Claude Code (for agent auth token)

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start Convex (local dev backend)

```bash
npx convex dev
```

This starts the Convex backend on `http://127.0.0.1:3210` (DB) and `http://127.0.0.1:3211` (HTTP/webhooks).

### 3. Seed agents

```bash
npx convex run seed:seedAgents
```

### 4. Start the UI

```bash
pnpm dev
```

Dashboard available at `http://localhost:5174`.

### 5. Set up OpenClaw agents

Make sure you're on Node 22+:

```bash
nvm use 22
```

Install OpenClaw if not already:

```bash
npm install -g openclaw
openclaw onboard --install-daemon
```

Add the 4 agents:

```bash
bash scripts/setup-agents.sh
```

Or manually:

```bash
openclaw agents add scout --workspace ./agents/scout --model anthropic/claude-sonnet-4-5 --non-interactive
openclaw agents add archer --workspace ./agents/archer --model anthropic/claude-sonnet-4-5 --non-interactive
openclaw agents add scribe --workspace ./agents/scribe --model anthropic/claude-sonnet-4-5 --non-interactive
openclaw agents add oracle --workspace ./agents/oracle --model anthropic/claude-sonnet-4-5 --non-interactive
```

### 6. Configure agent auth (Claude Code credentials)

In a separate terminal:

```bash
claude setup-token
```

Copy the token, then:

```bash
nvm use 22
openclaw configure --section model
```

Select **Anthropic** > **Anthropic token (paste setup-token)** > paste your token.

This uses your existing Claude subscription (no extra charges).

### 7. Verify setup

```bash
openclaw agents list
```

Should show: main, scout, archer, scribe, oracle.

## Testing

### Send a test booking

```bash
curl -X POST http://127.0.0.1:3211/webhooks/cal \
  -H "Content-Type: application/json" \
  -d '{
    "triggerEvent": "BOOKING_CREATED",
    "payload": {
      "bookingId": "booking-001",
      "title": "Discovery Call",
      "startTime": "2026-02-15T14:00:00Z",
      "endTime": "2026-02-15T14:30:00Z",
      "type": "discovery-call",
      "responses": {
        "email": { "value": "tim@apple.com" },
        "name": { "value": "Tim Cook" }
      }
    }
  }'
```

This creates a booking + 3 tasks (Scout, Archer, Oracle) and sets agents to working.

### Trigger agents manually

```bash
nvm use 22

# Trigger Scout to enrich
openclaw agent --agent scout --local -m "Heartbeat: Check for pending bookings, enrich leads, update tasks to done when complete."

# Trigger Archer to prep brief
openclaw agent --agent archer --local -m "Heartbeat: Check for assigned tasks, generate meeting briefs, update tasks to done."

# Trigger Oracle to predict
openclaw agent --agent oracle --local -m "Heartbeat: Check for assigned tasks, generate predictions, update tasks to done."
```

### Test meeting ended (triggers Scribe)

```bash
curl -X POST http://127.0.0.1:3211/webhooks/cal \
  -H "Content-Type: application/json" \
  -d '{
    "triggerEvent": "MEETING_ENDED",
    "payload": {
      "bookingId": "booking-001",
      "responses": {
        "email": { "value": "tim@apple.com" },
        "name": { "value": "Tim Cook" }
      }
    }
  }'

openclaw agent --agent scribe --local -m "Heartbeat: Check for assigned tasks, analyze meeting, update tasks to done."
```

## Automating with Cron

Set up heartbeat crons so agents check for work every 15 minutes (staggered):

```bash
nvm use 22

openclaw cron add --name scout-heartbeat --cron "0,15,30,45 * * * *" --agent scout \
  --message "Heartbeat: Check for pending bookings to enrich. Update tasks through the pipeline."

openclaw cron add --name archer-heartbeat --cron "3,18,33,48 * * * *" --agent archer \
  --message "Heartbeat: Check for assigned meeting-prep tasks. Generate briefs."

openclaw cron add --name scribe-heartbeat --cron "6,21,36,51 * * * *" --agent scribe \
  --message "Heartbeat: Check for post-meeting analysis tasks."

openclaw cron add --name oracle-heartbeat --cron "9,24,39,54 * * * *" --agent oracle \
  --message "Heartbeat: Check for prediction tasks. Analyze lead signals."
```

Verify crons:

```bash
openclaw cron list
```

## Useful Commands

```bash
# View all data
npx convex run tasks:list
npx convex run agents:list
npx convex run activities:list
npx convex run bookings:list
npx convex run enrichedLeads:list
npx convex run documents:list

# Clear all data
npx convex run seed:clearAll

# Re-seed agents
npx convex run seed:seedAgents

# Check agent status
openclaw agents list

# Remove a cron
openclaw cron delete --name scout-heartbeat

# Remove an agent
openclaw agents delete scout --force
```

## Stopping Everything

```bash
# Stop Vite dev server
# Ctrl+C in the terminal running `pnpm dev`

# Stop Convex
# Ctrl+C in the terminal running `npx convex dev`

# Stop OpenClaw gateway
openclaw gateway stop

# Remove all crons
openclaw cron delete --name scout-heartbeat
openclaw cron delete --name archer-heartbeat
openclaw cron delete --name scribe-heartbeat
openclaw cron delete --name oracle-heartbeat

# Remove all agents (optional)
openclaw agents delete scout --force
openclaw agents delete archer --force
openclaw agents delete scribe --force
openclaw agents delete oracle --force
```

## Project Structure

```
multi-claw/
├── convex/                  # Database schema + functions
│   ├── schema.ts            # 8 tables: agents, tasks, messages, activities, documents, notifications, enrichedLeads, bookings
│   ├── http.ts              # Cal.com webhook handler
│   ├── agents.ts            # Agent CRUD + status
│   ├── tasks.ts             # Task CRUD + Kanban transitions
│   ├── activities.ts        # Live feed entries
│   ├── bookings.ts          # Cal.com bookings
│   ├── enrichedLeads.ts     # Apollo enrichment data
│   ├── documents.ts         # Meeting briefs, reports
│   ├── messages.ts          # Task comments
│   ├── notifications.ts     # @mentions
│   └── seed.ts              # Seed/clear helpers
├── src/                     # React UI
│   ├── App.tsx              # 3-column layout
│   └── components/
│       ├── Header.tsx       # Stats bar + clock
│       ├── AgentsPanel.tsx  # Left: agent list + status
│       ├── AgentCard.tsx    # Individual agent card
│       ├── MissionQueue.tsx # Center: Kanban board
│       ├── TaskColumn.tsx   # Kanban column
│       ├── TaskCard.tsx     # Task card
│       ├── LiveFeed.tsx     # Right: activity feed
│       └── FeedItem.tsx     # Feed entry
├── agents/                  # Agent workspaces
│   ├── AGENTS.md            # Shared operating manual
│   ├── scout/               # Lead Intelligence
│   │   ├── SOUL.md
│   │   ├── HEARTBEAT.md
│   │   └── memory/WORKING.md
│   ├── archer/              # Meeting Strategist
│   ├── scribe/              # Post-Meeting Intel
│   └── oracle/              # Predictive Analytics
├── skills/
│   └── cal-enrichment/
│       ├── SKILL.md         # Enrichment skill definition
│       └── scripts/
│           ├── apollo-client.ts  # Apollo API client (with mock mode)
│           └── enrich-lead.ts    # Lead enrichment + scoring
└── scripts/
    ├── setup-agents.sh      # Register agents with OpenClaw
    └── setup-crons.sh       # Set up heartbeat crons
```

## Webhook Events

| Event | Creates |
|-------|---------|
| `BOOKING_CREATED` | Booking + 3 tasks (Scout, Archer, Oracle) |
| `MEETING_ENDED` | 1 task (Scribe) |
| `BOOKING_CANCELLED` | Updates booking status |
| `BOOKING_RESCHEDULED` | Updates booking status |

## Apollo.io Mock Mode

The enrichment API runs in mock mode by default (Apollo's free tier doesn't support API access). Mock data is available for:

- `tim@apple.com` — Tim Cook, CEO of Apple
- `satya@microsoft.com` — Satya Nadella, CEO of Microsoft
- Any other email — generates a generic Director of Operations profile

To use real Apollo API, add your key to `.env.local`:

```
APOLLO_API_KEY=your_key_here
```

## Environment Variables

```bash
# .env.local
CONVEX_DEPLOYMENT=anonymous:anonymous-multi-claw
VITE_CONVEX_URL=http://127.0.0.1:3210
VITE_CONVEX_SITE_URL=http://127.0.0.1:3211
# APOLLO_API_KEY=your_key_here  # Optional, mock mode works without it
```
