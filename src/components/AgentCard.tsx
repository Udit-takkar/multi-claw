import type { Doc } from "../../convex/_generated/dataModel";

const STATUS_COLORS = {
  working: "bg-status-working",
  idle: "bg-status-idle",
  blocked: "bg-status-blocked",
  offline: "bg-status-offline",
} as const;

const LEVEL_STYLES = {
  lead: "bg-amber-500 text-zinc-950",
  specialist: "bg-blue-500 text-white",
  intern: "bg-zinc-700 text-zinc-300",
} as const;

const LEVEL_LABELS = {
  lead: "LEAD",
  specialist: "SPC",
  intern: "INT",
} as const;

export function AgentCard({ agent }: { agent: Doc<"agents"> }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/12 bg-white/6 px-3 py-2.5 transition-all hover:bg-white/8">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-300">
        {agent.name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-200">{agent.name}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${LEVEL_STYLES[agent.level]}`}
          >
            {LEVEL_LABELS[agent.level]}
          </span>
        </div>
        <div className="truncate text-xs text-zinc-400">{agent.role}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[agent.status]}`} />
        <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
          {agent.status}
        </span>
      </div>
    </div>
  );
}
