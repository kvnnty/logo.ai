import OpenAI from 'openai';
import { config } from 'dotenv';
import path from 'path';

// Try to load env from .env or .env.local
config({ path: path.join(process.cwd(), '.env') });
config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.NEBIUS_API_KEY;

if (!apiKey) {
  console.error("No API KEY found");
  process.exit(1);
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://api.studio.nebius.ai/v1/",
});

async function main() {
  try {
    console.log("Fetching models...");
    const list = await client.models.list();
    console.log("Available Models:");
    list.data.forEach((m: any) => console.log(`- ${m.id}`));
  } catch (e) {
    console.error("Error fetching models:", e);
  }
}

main();
