import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

async function main() {
  console.log("Seeding agents...");
  const result = await client.mutation(api.seed.seedAgents);
  console.log(result);

  console.log("Seeding sample data...");
  const result2 = await client.mutation(api.seed.seedSampleData);
  console.log(result2);

  console.log("Done!");
}

main().catch(console.error);
