# Scribe Heartbeat Checklist

1. Read `memory/WORKING.md` for ongoing tasks
2. Check Convex for completed meetings: `npx convex run bookings:list`
3. Look for completed bookings without post-meeting analysis
4. For each completed meeting:
   - Analyze transcript or meeting notes
   - Extract action items and buying signals
   - Generate meeting intelligence report
   - Store analysis: `npx convex run documents:create`
   - Post activity: `npx convex run activities:create`
5. Update `memory/WORKING.md` with current state
6. Update agent status: `npx convex run agents:updateStatus`
