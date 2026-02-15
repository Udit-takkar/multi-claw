# Oracle Heartbeat Checklist

1. Read `memory/WORKING.md` for ongoing tasks
2. Check Convex for new data to analyze: `npx convex run bookings:list`
3. Review enriched leads and meeting outcomes
4. Generate predictions and analytics:
   - No-show risk scoring
   - Deal conversion probability
   - Pipeline health assessment
5. Store reports: `npx convex run documents:create`
6. Post activity: `npx convex run activities:create`
7. Update `memory/WORKING.md` with current state
8. Update agent status: `npx convex run agents:updateStatus`
