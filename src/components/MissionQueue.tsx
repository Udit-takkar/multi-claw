import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TaskColumn } from "./TaskColumn";

const COLUMNS = [
  { status: "inbox" as const, label: "Inbox" },
  { status: "assigned" as const, label: "Assigned" },
  { status: "in_progress" as const, label: "In Progress" },
  { status: "review" as const, label: "Review" },
  { status: "done" as const, label: "Done" },
];

export function MissionQueue() {
  const tasks = useQuery(api.tasks.list) ?? [];

  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-white/12 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          Mission Queue
        </span>
        <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
          {activeTasks} active
        </span>
      </div>
      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {COLUMNS.map((col) => (
          <TaskColumn
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={tasks}
          />
        ))}
      </div>
    </main>
  );
}
