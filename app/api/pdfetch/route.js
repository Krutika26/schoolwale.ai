// import { pinecone } from "../../../lib/pinecone-client";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const source = searchParams.get("source");

//     if (!source) {
//       return NextResponse.json({ error: "Missing source parameter" }, { status: 400 });
//     }

//     const index = pinecone.Index(process.env.PINECONE_INDEX);

//     // Use a minimal non-zero dummy vector
//     const dummyVector = Array.from({ length: 384 }, () => 0.001);

//     const queryResults = await index.query({
//       vector: dummyVector,
//       topK: 100, // Adjust based on your expected number of chunks
//       includeMetadata: true,
//       filter: {
//         source: { $eq: source },
//       },
//     });

//     const results = queryResults.matches?.map(match => ({
//       id: match.id,
//       score: match.score,
//       text: match.metadata?.text || "",
//       source: match.metadata?.source || "",
//     })) || [];

//     return NextResponse.json({ results }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching indexed data:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }  

// /app/api/pdfetch/route.js


// GET handler
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");

  if (!source) {
    return new Response(JSON.stringify({ error: "Missing 'source' query parameter." }), { status: 400 });
  }

  const serverRes = await fetch(`http://127.0.0.1:5000/search?query=${encodeURIComponent(source)}`);
  const text = await serverRes.text(); // read as plain text
  console.log("Flask response:", text);

  try {
    const data = JSON.parse(text); // try converting to JSON manually
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON from Flask", details: text }), { status: 500 });
  }
}
