import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const activities = await ctx.db.query("activities").collect();
    return activities.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
  },
});

export const create = mutation({
  args: {
    type: v.union(
      v.literal("task_created"),
      v.literal("task_updated"),
      v.literal("message_sent"),
      v.literal("document_created"),
      v.literal("booking_enriched"),
      v.literal("meeting_prepped"),
      v.literal("follow_up_sent"),
      v.literal("status_changed"),
    ),
    agentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
