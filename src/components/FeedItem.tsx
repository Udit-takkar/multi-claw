import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `about ${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function FeedItem({ activity }: { activity: Doc<"activities"> }) {
  const agents = useQuery(api.agents.list);
  const agent = agents?.find((a) => a._id === activity.agentId);

  return (
    <div className="border-b border-white/6 px-4 py-3">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">
          {agent?.name[0] ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-300">
            <span className="font-semibold text-zinc-200">{agent?.name ?? "Unknown"}</span>{" "}
            {activity.message}
          </p>
          <span className="text-[10px] text-zinc-500">{timeAgo(activity.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
