import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("bookings").collect();
  },
});

export const getByCalId = query({
  args: { calBookingId: v.string() },
  handler: async (ctx, args) => {
    const bookings = await ctx.db.query("bookings").collect();
    return bookings.find((b) => b.calBookingId === args.calBookingId) ?? null;
  },
});

export const create = mutation({
  args: {
    calBookingId: v.string(),
    title: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    attendeeEmail: v.string(),
    attendeeName: v.string(),
    eventType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", {
      ...args,
      status: "confirmed",
      enrichmentStatus: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("rescheduled"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateEnrichmentStatus = mutation({
  args: {
    id: v.id("bookings"),
    enrichmentStatus: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("done"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { enrichmentStatus: args.enrichmentStatus });
  },
});
