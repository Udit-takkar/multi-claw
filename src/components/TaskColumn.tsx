import type { Doc } from "../../convex/_generated/dataModel";
import { TaskCard } from "./TaskCard";

const STATUS_COLORS = {
  inbox: "bg-zinc-500",
  assigned: "bg-blue-500",
  in_progress: "bg-amber-500",
  review: "bg-emerald-500",
  done: "bg-zinc-600",
} as const;

type TaskStatus = Doc<"tasks">["status"];

export function TaskColumn({
  status,
  label,
  tasks,
}: {
  status: TaskStatus;
  label: string;
  tasks: Doc<"tasks">[];
}) {
  const filtered = tasks.filter((t) => t.status === status);

  return (
    <div className="flex min-w-[260px] flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          {label}
        </span>
        <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400">
          {filtered.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {filtered.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}
