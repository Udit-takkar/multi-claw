import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AgentCard } from "./AgentCard";

export function AgentsPanel() {
  const agents = useQuery(api.agents.list);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/12 bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-white/12 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-status-working" />
        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          Agents
        </span>
        <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
          {agents?.length ?? 0}
        </span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {agents?.map((agent) => <AgentCard key={agent._id} agent={agent} />)}
      </div>
    </aside>
  );
}
