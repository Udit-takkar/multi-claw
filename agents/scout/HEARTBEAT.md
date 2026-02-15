# Scout Heartbeat Checklist

1. Read `memory/WORKING.md` for ongoing tasks
2. Check Convex for new bookings: `npx convex run bookings:list`
3. Look for bookings with `enrichmentStatus: "pending"`
4. For each pending booking:
   - Update enrichment status to "in_progress"
   - Research the attendee (LinkedIn, company, news)
   - Score lead quality (0-100)
   - Store enriched data: `npx convex run enrichedLeads:create`
   - Update enrichment status to "done"
   - Post activity: `npx convex run activities:create`
5. Check for @mentions in notifications: `npx convex run notifications:getUndelivered`
6. Update `memory/WORKING.md` with current state
7. Update agent status: `npx convex run agents:updateStatus`
