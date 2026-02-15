import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FeedItem } from "./FeedItem";

export function LiveFeed() {
  const activities = useQuery(api.activities.list) ?? [];

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-white/12 bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-white/12 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          Live Feed
        </span>
        <span className="relative ml-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            No activity yet. Agents will appear here when they start working.
          </div>
        ) : (
          activities.map((activity) => (
            <FeedItem key={activity._id} activity={activity} />
          ))
        )}
      </div>
    </aside>
  );
}
