import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/webhooks/cal",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const triggerEvent = body.triggerEvent;
    const payload = body.payload;

    if (triggerEvent === "BOOKING_CREATED") {
      const attendeeName =
        payload.responses?.name?.value ?? payload.attendees?.[0]?.name ?? "Unknown";
      const attendeeEmail =
        payload.responses?.email?.value ?? payload.attendees?.[0]?.email ?? "";
      const calBookingId = String(payload.bookingId ?? payload.uid ?? Date.now());
      const meetingTitle = payload.title ?? "Meeting";
      const startTime = payload.startTime ?? "";

      await ctx.runMutation(api.bookings.create, {
        calBookingId,
        title: meetingTitle,
        startTime,
        endTime: payload.endTime ?? "",
        attendeeEmail,
        attendeeName,
        eventType: payload.type ?? "default",
      });

      const [scout, archer, oracle] = await Promise.all([
        ctx.runQuery(api.agents.getBySessionKey, { sessionKey: "agent:scout:main" }),
        ctx.runQuery(api.agents.getBySessionKey, { sessionKey: "agent:archer:main" }),
        ctx.runQuery(api.agents.getBySessionKey, { sessionKey: "agent:oracle:main" }),
      ]);

      const enrichTaskId = await ctx.runMutation(api.tasks.create, {
        title: `Enrich lead: ${attendeeName}`,
        description: `New booking from ${attendeeName} (${attendeeEmail}). Research profile, company background, and score lead quality.`,
        priority: "high",
        assigneeIds: scout ? [scout._id] : [],
        tags: ["enrichment", "lead-research"],
        bookingId: calBookingId,
      });

      const prepTaskId = await ctx.runMutation(api.tasks.create, {
        title: `Prep brief: ${attendeeName} (${meetingTitle})`,
        description: `Generate strategic meeting brief with talking points for ${meetingTitle} with ${attendeeName} (${attendeeEmail}). Use enriched lead data once available.`,
        priority: "medium",
        assigneeIds: archer ? [archer._id] : [],
        tags: ["meeting-prep", "brief"],
        bookingId: calBookingId,
      });

      const predictTaskId = await ctx.runMutation(api.tasks.create, {
        title: `Predict no-show risk: ${attendeeName}`,
        description: `Analyze lead signals for ${attendeeName} (${attendeeEmail}) to predict no-show likelihood and deal conversion probability.`,
        priority: "medium",
        assigneeIds: oracle ? [oracle._id] : [],
        tags: ["analytics", "prediction"],
        bookingId: calBookingId,
      });

      if (scout) {
        await ctx.runMutation(api.agents.updateStatus, { id: scout._id, status: "working" });
        await ctx.runMutation(api.agents.setCurrentTask, { id: scout._id, taskId: enrichTaskId });
        await ctx.runMutation(api.activities.create, {
          type: "task_created",
          agentId: scout._id,
          taskId: enrichTaskId,
          message: `New booking: ${attendeeName} (${attendeeEmail}) — ${meetingTitle}. Starting lead enrichment.`,
        });
      }
      if (archer) {
        await ctx.runMutation(api.agents.updateStatus, { id: archer._id, status: "working" });
        await ctx.runMutation(api.agents.setCurrentTask, { id: archer._id, taskId: prepTaskId });
        await ctx.runMutation(api.activities.create, {
          type: "task_created",
          agentId: archer._id,
          taskId: prepTaskId,
          message: `Queued meeting prep brief for ${attendeeName} — ${meetingTitle}.`,
        });
      }
      if (oracle) {
        await ctx.runMutation(api.agents.updateStatus, { id: oracle._id, status: "working" });
        await ctx.runMutation(api.agents.setCurrentTask, { id: oracle._id, taskId: predictTaskId });
        await ctx.runMutation(api.activities.create, {
          type: "task_created",
          agentId: oracle._id,
          taskId: predictTaskId,
          message: `Queued no-show risk prediction for ${attendeeName}.`,
        });
      }
    }

    if (triggerEvent === "MEETING_ENDED") {
      const attendeeName =
        payload.responses?.name?.value ?? payload.attendees?.[0]?.name ?? "Unknown";
      const attendeeEmail =
        payload.responses?.email?.value ?? payload.attendees?.[0]?.email ?? "";
      const calBookingId = String(payload.bookingId ?? payload.uid ?? Date.now());

      const scribe = await ctx.runQuery(api.agents.getBySessionKey, {
        sessionKey: "agent:scribe:main",
      });

      await ctx.runMutation(api.tasks.create, {
        title: `Analyze meeting: ${attendeeName}`,
        description: `Meeting with ${attendeeName} (${attendeeEmail}) just ended. Analyze transcript for action items, buying signals, and deal scoring.`,
        priority: "high",
        assigneeIds: scribe ? [scribe._id] : [],
        tags: ["transcript", "post-meeting"],
        bookingId: calBookingId,
      });
    }

    if (triggerEvent === "BOOKING_CANCELLED") {
      const calId = String(payload.bookingId ?? payload.uid);
      const booking = await ctx.runQuery(api.bookings.getByCalId, {
        calBookingId: calId,
      });
      if (booking) {
        await ctx.runMutation(api.bookings.updateStatus, {
          id: booking._id,
          status: "cancelled",
        });
      }
    }

    if (triggerEvent === "BOOKING_RESCHEDULED") {
      const calId = String(payload.bookingId ?? payload.uid);
      const booking = await ctx.runQuery(api.bookings.getByCalId, {
        calBookingId: calId,
      });
      if (booking) {
        await ctx.runMutation(api.bookings.updateStatus, {
          id: booking._id,
          status: "rescheduled",
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
