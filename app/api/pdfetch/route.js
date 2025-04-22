// import { pinecone } from "../../../lib/pinecone-client"; // adjust path if needed
// import { NextResponse } from "next/server";

// export async function GET(req) {
//     try {
//       const { searchParams } = new URL(req.url);
//       const source = searchParams.get("source"); // e.g. "example.pdf"
  
//       const index = pinecone.Index(process.env.PINECONE_INDEX);
  
//       const queryOptions = {
//         topK: 100,
//         includeMetadata: true,
//       };
  
//       if (source) {
//         queryOptions.filter = {
//           source: { $eq: source },
//         };
//       }
  
//       const queryResults = await index.query({
//         vector: new Array(384).fill(0), // dummy vector to get metadata
//         ...queryOptions,
//       });
  
//       const results = queryResults.matches.map(match => ({
//         id: match.id,
//         score: match.score,
//         text: match.metadata?.text || "",
//         source: match.metadata?.source || "",
//       }));
//       console.log(results)
  
//       return NextResponse.json({ results }, { status: 200 });
//     } catch (error) {
//       console.error("Error fetching indexed data:", error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }
//   }


import { pinecone } from "../../../lib/pinecone-client";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source");

    if (!source) {
      return NextResponse.json({ error: "Missing source parameter" }, { status: 400 });
    }

    const index = pinecone.Index(process.env.PINECONE_INDEX);

    // Use a minimal non-zero dummy vector
    const dummyVector = Array.from({ length: 384 }, () => 0.001);

    const queryResults = await index.query({
      vector: dummyVector,
      topK: 100, // Adjust based on your expected number of chunks
      includeMetadata: true,
      filter: {
        source: { $eq: source },
      },
    });

    const results = queryResults.matches?.map(match => ({
      id: match.id,
      score: match.score,
      text: match.metadata?.text || "",
      source: match.metadata?.source || "",
    })) || [];

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Error fetching indexed data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}  