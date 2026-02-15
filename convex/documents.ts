import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("documents").collect();
  },
});

export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("meeting_brief"),
      v.literal("lead_research"),
      v.literal("meeting_notes"),
      v.literal("report"),
      v.literal("email_draft"),
    ),
    taskId: v.optional(v.id("tasks")),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
