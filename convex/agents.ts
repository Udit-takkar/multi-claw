import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySessionKey = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("agents").collect();
    return agents.find((a) => a.sessionKey === args.sessionKey) ?? null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    level: v.union(v.literal("lead"), v.literal("specialist"), v.literal("intern")),
    sessionKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      status: "idle",
      tasksCompleted: 0,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(
      v.literal("working"),
      v.literal("idle"),
      v.literal("blocked"),
      v.literal("offline"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const setCurrentTask = mutation({
  args: {
    id: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { currentTaskId: args.taskId });
  },
});

export const incrementCompleted = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (agent) {
      await ctx.db.patch(args.id, { tasksCompleted: agent.tasksCompleted + 1 });
    }
  },
});
