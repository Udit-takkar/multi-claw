import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUndelivered = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("delivered"), false))
      .collect();
  },
});

export const create = mutation({
  args: {
    mentionedAgentId: v.id("agents"),
    fromAgentId: v.optional(v.id("agents")),
    content: v.string(),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      delivered: false,
      createdAt: Date.now(),
    });
  },
});

export const markDelivered = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { delivered: true });
  },
});
