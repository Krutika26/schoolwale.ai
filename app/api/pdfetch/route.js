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

  console.log(`http://127.0.0.1:5000/search?name=${encodeURIComponent(source)}`)

  try {
    const serverRes = await fetch(`http://127.0.0.1:5000/search?name=${encodeURIComponent(source)}`);
    
    // Check if the server response is valid JSON
    const text = await serverRes.text(); // Read the response as text
    console.log("Server Response Text:", text);  // Log the raw response

    let data;
    try {
      data = JSON.parse(text);  // Try parsing the response as JSON
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON from Flask", details: text }), { status: 500 });
    }

    // Log the parsed JSON response
    console.log("Parsed JSON Response:", data);

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error }), { status: 404 });
    }

    // Assuming the results are returned in 'results' and each contains text or metadata
    const fullText = data.results.join(" ").replace(/\n/g, " ").trim(); // If you want names
    return new Response(JSON.stringify({ fullText }), { status: 200 });

  } catch (error) {
    console.error("Error fetching from Flask server:", error);
    return new Response(JSON.stringify({ error: "Server error", details: error.message }), { status: 500 });
  }
}