import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const PRIORITY_STYLES = {
  urgent: "border-l-red-500",
  high: "border-l-amber-500",
  medium: "border-l-blue-500",
  low: "border-l-zinc-600",
} as const;

export function TaskCard({ task }: { task: Doc<"tasks"> }) {
  const agents = useQuery(api.agents.list);

  const assignees = agents?.filter((a) => task.assigneeIds.includes(a._id)) ?? [];

  return (
    <div
      className={`rounded-lg border border-white/12 border-l-[3px] bg-white/6 p-3 transition-all hover:bg-white/8 ${PRIORITY_STYLES[task.priority]}`}
    >
      <h4 className="text-sm font-semibold leading-snug text-zinc-200">{task.title}</h4>
      <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{task.description}</p>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {assignees.map((a) => (
            <div
              key={a._id}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-300 ring-1 ring-zinc-700"
              title={a.name}
            >
              {a.name[0]}
            </div>
          ))}
        </div>
        <span className="text-[10px] text-zinc-500">{timeAgo(task.createdAt)}</span>
      </div>

      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-zinc-800/50 px-1.5 py-0.5 text-[10px] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
