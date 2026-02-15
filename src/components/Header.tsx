import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export function Header() {
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAgents = agents?.filter((a) => a.status === "working").length ?? 0;
  const totalTasks = tasks?.filter((t) => t.status !== "done").length ?? 0;

  return (
    <header className="flex items-center justify-between border-b border-white/12 bg-zinc-950 px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tracking-wider text-zinc-200">
          ◇ MISSION CONTROL
        </span>
        <span className="rounded-md bg-white/6 px-2.5 py-0.5 text-sm font-medium text-zinc-300">
          Cal.com
        </span>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-zinc-200">{activeAgents}</div>
          <div className="text-[10px] tracking-widest text-zinc-500 uppercase">
            Agents Active
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-zinc-200">{totalTasks}</div>
          <div className="text-[10px] tracking-widest text-zinc-500 uppercase">
            Tasks in Queue
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-bold text-zinc-300">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div className="text-[10px] tracking-widest text-zinc-500 uppercase">
            {time.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-xs tracking-wider text-zinc-400 uppercase">
            Online
          </span>
        </div>
      </div>
    </header>
  );
}
