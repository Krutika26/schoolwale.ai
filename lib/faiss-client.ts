// import { Pinecone } from "@pinecone-database/pinecone";

// const pinecone = new Pinecone({
//   apiKey: process.env.PINECONE_API_KEY,
// });

// export { pinecone };

const API_URL = "http://localhost:5000";

export async function upsertVectors(vectors: any[]) {
  const res = await fetch(`${API_URL}/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vectors }),
  });
  return res.json();
}

export async function queryVector(vector: number[], topK = 5) {
  const res = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vector, topK }),
  });
  return res.json();
}