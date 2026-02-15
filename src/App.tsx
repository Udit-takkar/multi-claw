import { Header } from "./components/Header";
import { AgentsPanel } from "./components/AgentsPanel";
import { MissionQueue } from "./components/MissionQueue";
import { LiveFeed } from "./components/LiveFeed";

export default function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <AgentsPanel />
        <MissionQueue />
        <LiveFeed />
      </div>
    </div>
  );
}
