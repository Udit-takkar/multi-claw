import { mutation } from "./_generated/server";

export const clearAll = mutation({
  handler: async (ctx) => {
    const tables = [
      "agents",
      "tasks",
      "messages",
      "activities",
      "documents",
      "notifications",
      "enrichedLeads",
      "bookings",
    ] as const;

    let total = 0;
    for (const table of tables) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) {
        await ctx.db.delete(row._id);
        total++;
      }
    }

    return `Cleared ${total} records across all tables`;
  },
});

export const seedAgents = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    if (existing.length > 0) return "Agents already seeded";

    const agents = [
      {
        name: "Scout",
        role: "Lead Intelligence",
        level: "specialist" as const,
        sessionKey: "agent:scout:main",
        status: "idle" as const,
        tasksCompleted: 0,
      },
      {
        name: "Archer",
        role: "Meeting Strategist",
        level: "specialist" as const,
        sessionKey: "agent:archer:main",
        status: "idle" as const,
        tasksCompleted: 0,
      },
      {
        name: "Scribe",
        role: "Post-Meeting Intel",
        level: "specialist" as const,
        sessionKey: "agent:scribe:main",
        status: "idle" as const,
        tasksCompleted: 0,
      },
      {
        name: "Oracle",
        role: "Predictive Analytics",
        level: "lead" as const,
        sessionKey: "agent:oracle:main",
        status: "idle" as const,
        tasksCompleted: 0,
      },
    ];

    for (const agent of agents) {
      await ctx.db.insert("agents", agent);
    }

    return "Seeded 4 agents";
  },
});

export const seedSampleData = mutation({
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    if (agents.length === 0) return "Seed agents first";

    const tasks = await ctx.db.query("tasks").collect();
    if (tasks.length > 0) return "Sample data already exists";

    const scout = agents.find((a) => a.name === "Scout")!;
    const archer = agents.find((a) => a.name === "Archer")!;
    const scribe = agents.find((a) => a.name === "Scribe")!;
    const oracle = agents.find((a) => a.name === "Oracle")!;

    const now = Date.now();

    const task1 = await ctx.db.insert("tasks", {
      title: "Enrich lead: john@techstartup.io",
      description:
        "New booking from John Smith. Research LinkedIn profile, company background, and recent news.",
      status: "in_progress",
      priority: "high",
      assigneeIds: [scout._id],
      tags: ["enrichment", "lead-research"],
      bookingId: "booking-001",
      createdAt: now - 3600000,
      updatedAt: now - 1800000,
    });

    const task2 = await ctx.db.insert("tasks", {
      title: "Prep brief: Sarah Johnson (Wed 2pm)",
      description:
        "Generate strategic meeting brief with talking points for upcoming call with Sarah Johnson, VP Engineering at CloudScale.",
      status: "assigned",
      priority: "medium",
      assigneeIds: [archer._id],
      tags: ["meeting-prep", "brief"],
      createdAt: now - 7200000,
      updatedAt: now - 7200000,
    });

    await ctx.db.insert("tasks", {
      title: "Analyze transcript: Mike Chen call",
      description:
        "Meeting with Mike Chen (CTO, DataFlow) just ended. Analyze transcript for action items, buying signals, and deal scoring.",
      status: "inbox",
      priority: "high",
      assigneeIds: [],
      tags: ["transcript", "post-meeting"],
      createdAt: now - 900000,
      updatedAt: now - 900000,
    });

    await ctx.db.insert("tasks", {
      title: "Weekly pipeline intelligence report",
      description:
        "Generate weekly report: deal conversion predictions, no-show patterns, optimal meeting time analysis.",
      status: "review",
      priority: "medium",
      assigneeIds: [oracle._id],
      tags: ["analytics", "report"],
      createdAt: now - 86400000,
      updatedAt: now - 3600000,
    });

    await ctx.db.insert("tasks", {
      title: "Enrich lead: lisa@enterprise.com",
      description: "Completed enrichment for Lisa Park, Director of Operations at Enterprise Corp.",
      status: "done",
      priority: "medium",
      assigneeIds: [scout._id],
      tags: ["enrichment", "lead-research"],
      bookingId: "booking-002",
      createdAt: now - 172800000,
      updatedAt: now - 86400000,
    });

    await ctx.db.insert("activities", {
      type: "booking_enriched",
      agentId: scout._id,
      taskId: task1,
      message: 'enriched lead: John Smith (VP Product @ TechStartup, Series B)',
      createdAt: now - 1800000,
    });

    await ctx.db.insert("activities", {
      type: "meeting_prepped",
      agentId: archer._id,
      taskId: task2,
      message: "created strategic brief for Wed 2pm call with Sarah Johnson",
      createdAt: now - 3600000,
    });

    await ctx.db.insert("activities", {
      type: "status_changed",
      agentId: scribe._id,
      message: "extracted 5 action items from Mike Chen transcript",
      createdAt: now - 900000,
    });

    await ctx.db.insert("activities", {
      type: "document_created",
      agentId: oracle._id,
      message: 'generated weekly pipeline report: 73% avg conversion, 3 at-risk deals flagged',
      createdAt: now - 7200000,
    });

    await ctx.db.insert("activities", {
      type: "booking_enriched",
      agentId: scout._id,
      message: "no-show risk HIGH for Friday booking (lead score: 32/100)",
      createdAt: now - 600000,
    });

    await ctx.db.patch(scout._id, { status: "working", currentTaskId: task1 });
    await ctx.db.patch(archer._id, { status: "idle" });
    await ctx.db.patch(scribe._id, { status: "working" });
    await ctx.db.patch(oracle._id, { status: "idle" });

    return "Seeded sample data";
  },
});
