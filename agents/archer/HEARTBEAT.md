# Archer Heartbeat Checklist

1. Read `memory/WORKING.md` for ongoing tasks
2. Check Convex for upcoming meetings: `npx convex run bookings:list`
3. Look for confirmed bookings within 2 hours that lack a meeting brief
4. For each upcoming meeting:
   - Check if enriched lead data exists
   - Generate strategic meeting brief with talking points
   - Store brief: `npx convex run documents:create`
   - Post activity: `npx convex run activities:create`
5. Update `memory/WORKING.md` with current state
6. Update agent status: `npx convex run agents:updateStatus`
