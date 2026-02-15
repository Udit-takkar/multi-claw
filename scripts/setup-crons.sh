#!/bin/bash
set -e

echo "Setting up heartbeat crons for all agents..."

openclaw cron add \
  --name "scout-heartbeat" \
  --cron "0,15,30,45 * * * *" \
  --agent scout \
  --message "Heartbeat: Check for pending bookings to enrich. Update tasks through the pipeline." \
  2>/dev/null || echo "scout-heartbeat already exists"

openclaw cron add \
  --name "archer-heartbeat" \
  --cron "3,18,33,48 * * * *" \
  --agent archer \
  --message "Heartbeat: Check for assigned meeting-prep tasks. Generate briefs." \
  2>/dev/null || echo "archer-heartbeat already exists"

openclaw cron add \
  --name "scribe-heartbeat" \
  --cron "6,21,36,51 * * * *" \
  --agent scribe \
  --message "Heartbeat: Check for post-meeting analysis tasks." \
  2>/dev/null || echo "scribe-heartbeat already exists"

openclaw cron add \
  --name "oracle-heartbeat" \
  --cron "9,24,39,54 * * * *" \
  --agent oracle \
  --message "Heartbeat: Check for prediction tasks. Analyze lead signals." \
  2>/dev/null || echo "oracle-heartbeat already exists"

echo ""
echo "Heartbeat crons configured (staggered every 3 minutes):"
echo "  Scout:  :00, :15, :30, :45"
echo "  Archer: :03, :18, :33, :48"
echo "  Scribe: :06, :21, :36, :51"
echo "  Oracle: :09, :24, :39, :54"
echo ""
echo "View crons with: openclaw cron list"
