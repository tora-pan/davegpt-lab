import "dotenv/config";
import { sql } from "drizzle-orm";
import OpenAI from "openai";
import { db, pool } from "../db/client";
import { demoMemories } from "../db/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = "text-embedding-3-small";

const SEED_MEMORIES = [
  "Paid $1,450 for rent on the 1st of the month.",
  "Spent $87.32 at Trader Joe's on groceries.",
  "Netflix subscription charged $15.49.",
  "Spotify Premium charged $11.99.",
  "Received paycheck deposit of $3,200.",
  "Spent $42.10 on gas at Shell.",
  "Paid $60 for gym membership.",
  "Spent $23.50 on coffee this week across 5 visits.",
  "Transferred $500 into savings account.",
  "Amazon Prime subscription charged $14.99.",
];

async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error("OpenAI embeddings response contained no data");
  }
  return embedding;
}

async function seedIfEmpty() {
  const existing = await db.select({ id: demoMemories.id }).from(demoMemories).limit(1);
  if (existing.length > 0) return;

  console.log(`Seeding ${SEED_MEMORIES.length} demo memories...`);
  for (const content of SEED_MEMORIES) {
    const embedding = await embed(content);
    await db.insert(demoMemories).values({ content, embedding });
  }
}

async function search(query: string, limit = 5) {
  const embedding = await embed(query);
  const distance = sql<number>`${demoMemories.embedding} <=> ${JSON.stringify(embedding)}`;

  return db
    .select({ content: demoMemories.content, distance })
    .from(demoMemories)
    .orderBy(distance)
    .limit(limit);
}

async function main() {
  const query = process.argv.slice(2).join(" ") || "subscriptions I'm paying for";

  await seedIfEmpty();

  console.log(`\nQuery: "${query}"\n`);
  const results = await search(query);
  results.forEach((row, i) => {
    console.log(`${i + 1}. [distance ${row.distance.toFixed(4)}] ${row.content}`);
  });

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
