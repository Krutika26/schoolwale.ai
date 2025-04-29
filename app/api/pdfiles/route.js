// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { pinecone } from "../../../lib/pinecone-client"; // Adjust path if needed
// import { pipeline } from "@xenova/transformers";
// import { writeFile } from "fs/promises";
// import path from "path";
// import { tmpdir } from "os";
// import { randomUUID } from "crypto";

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const tempFilePath = path.join(tmpdir(), `${randomUUID()}-${file.name}`);
//     await writeFile(tempFilePath, buffer);

//     const loader = new PDFLoader(tempFilePath);
//     const docs = await loader.load();

//     const splitter = new RecursiveCharacterTextSplitter({
//       chunkSize: 1000,
//       chunkOverlap: 200,
//     });
//     const splits = await splitter.splitDocuments(docs);

//     const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

//     const vectors = await Promise.all(
//       splits.map(async (doc, i) => {
//         const embeddingTensor = await embedder(doc.pageContent, {
//           pooling: "mean",
//           normalize: true,
//         });
//         return {
//           id: `doc-chunk-${i}-${randomUUID()}`, // Ensures uniqueness
//           values: Array.from(embeddingTensor.data),
//           metadata: {
//             text: doc.pageContent,
//             source: file.name,
//           },
//         };
//       })
//     );

//     const index = pinecone.Index(process.env.PINECONE_INDEX);

//     // Optional: check if content exists (basic check via score similarity)
//     const queryResults = await index.query({
//       vector: vectors[0].values,
//       topK: 1,
//       includeMetadata: true,
//     });
//     console.log("Sources found:", queryResults.matches.map(m => m.metadata?.source));

//     const similarScore = queryResults.matches?.[0]?.score || 0;

//     if (similarScore > 0.95) {
//       console.log("PDF already indexed. Skipping upload.");
//     } else {
//       const upsertResponse = await index.upsert(vectors, "pdf-docs");
//       console.log("Upsert response:", upsertResponse);
//     }

//     return new Response(
//       JSON.stringify({
//         message: "PDF indexed successfully",
//         chunksIndexed: vectors.length,
//       }),
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("ERROR while indexing PDF:", error);
//     return new Response(JSON.stringify({ error: error.message }), { status: 500 });
//   }
// }

// /app/api/pdfiles/route.js

// POST handler
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse the form data from the request
    const formData = await req.formData();
    const file = formData.get("file");

    // Check if a file was uploaded
    if (!file) {
      console.error("No file uploaded");
      return new NextResponse(JSON.stringify({ error: "No file uploaded." }), { status: 400 });
    }

    console.log("Uploaded file:", file.name);

    // Convert the file to a buffer
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });

    // Log file size and type to make sure it's being handled correctly
    console.log(`File Type: ${file.type}`);
    console.log(`File Size: ${file.size} bytes`);

    // Create a new FormData instance to send the file to the FAISS server
    const formDataToSend = new FormData();
    formDataToSend.append("file", blob, file.name);
    console.log("file"+formDataToSend)

    // Send the file to the external FAISS server (ensure this URL is correct)
    const serverRes = await fetch("http://127.0.0.1:5000/add_vectors", {
      method: "POST",
      body: formDataToSend,
    });

    console.log(serverRes)

    // Check for errors from the FAISS server response
    if (!serverRes.ok) {
      console.error("Upload to FAISS server failed:", serverRes.status);
      return new NextResponse(
        JSON.stringify({ error: `Upload to FAISS server failed: ${serverRes.status}` }),
        { status: 500 }
      );
    }

    // Parse the response from the FAISS server
    const result = await serverRes.json();
    console.log("FAISS server response:", result);

    // Return the result from the FAISS server to the client
    return new NextResponse(JSON.stringify(result), { status: 200 });

  } catch (error) {
    console.error("Error during file processing:", error);
    // Handle unexpected errors gracefully
    return new NextResponse(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
