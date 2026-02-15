import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("enrichedLeads").collect();
  },
});

export const getByBooking = query({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    const leads = await ctx.db.query("enrichedLeads").collect();
    return leads.find((l) => l.bookingId === args.bookingId) ?? null;
  },
});

export const create = mutation({
  args: {
    bookingId: v.string(),
    contactEmail: v.string(),
    contactName: v.string(),
    apolloId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    headline: v.optional(v.string()),
    title: v.optional(v.string()),
    seniority: v.optional(v.string()),
    location: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companySize: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    companyLinkedinUrl: v.optional(v.string()),
    industry: v.optional(v.string()),
    fundingStage: v.optional(v.string()),
    estimatedEmployees: v.optional(v.number()),
    annualRevenue: v.optional(v.number()),
    totalFunding: v.optional(v.number()),
    foundedYear: v.optional(v.number()),
    twitterUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    employmentHistory: v.optional(
      v.array(
        v.object({
          organizationName: v.string(),
          title: v.string(),
          current: v.boolean(),
          startDate: v.optional(v.string()),
          endDate: v.optional(v.string()),
        }),
      ),
    ),
    salesSignals: v.optional(v.array(v.string())),
    isLikelyToEngage: v.optional(v.boolean()),
    leadScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("enrichedLeads", {
      ...args,
      enrichedAt: Date.now(),
    });
  },
});
