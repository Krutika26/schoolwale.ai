// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { pinecone } from "../../../lib/pinecone-client";
// import { pipeline } from "@xenova/transformers";

// function generateChunkIds(count) {
//   return Array.from({ length: count }, (_, i) => `doc-chunk-${i}`);
// }

// export async function GET(req) {
//   try {
//     const loader = new PDFLoader("public/nike.pdf");
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
//           id: `doc-chunk-${i}`,
//           values: Array.from(embeddingTensor.data),
//           metadata: {
//             text: doc.pageContent,
//             source: doc.metadata?.source || "nike.pdf",
//           },
//         };
//       })
//     );

//     const index = pinecone.Index(process.env.PINECONE_INDEX);
//     await index.upsert(vectors, {
//       namespace: "pdf-docs",
//     });    

//     return Response.json({
//       message: "PDF indexed successfully",
//       chunksIndexed: vectors.length,
//       chunks: splits.map((doc, i) => ({
//         id: `doc-chunk-${i}`,
//         pageContent: doc.pageContent,
//         metadata: {
//           source: doc.metadata?.source || "nike.pdf",
//         },
//       })),
//     });
//   } catch (error) {
//     console.error("ERROR while indexing PDF:", error);
//     return Response.json({ error: error.message }, { status: 500 });
//   }
// }

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { pinecone } from "../../../lib/pinecone-client";
import { pipeline } from "@xenova/transformers";

function generateChunkIds(count) {
  return Array.from({ length: count }, (_, i) => `doc-chunk-${i}`);
}

export async function GET(req) {
  try {
    const loader = new PDFLoader("public/nike.pdf");
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splits = await splitter.splitDocuments(docs);

    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    const vectors = await Promise.all(
      splits.map(async (doc, i) => {
        const embeddingTensor = await embedder(doc.pageContent, {
          pooling: "mean",
          normalize: true,
        });
        return {
          id: `doc-chunk-${i}`,
          values: Array.from(embeddingTensor.data),
          metadata: {
            text: doc.pageContent,
            source: doc.metadata?.source || "nike.pdf",
          },
        };
      })
    );

    const index = pinecone.Index(process.env.PINECONE_INDEX);

    // Check if vectors already exist by querying the vector IDs
    const ids = vectors.map((vector) => vector.id);
    const queryResults = await index.query({
      vector: vectors[0].values,  // Query the first vector as a representative one
      topK: 1,  // Retrieve the most similar match
      includeMetadata: true,  // To retrieve metadata if necessary
    });

    // Check if any of the vectors already exist
    const existingIds = queryResults.matches.map((match) => match.id);
    const newVectors = vectors.filter((vector) => !existingIds.includes(vector.id));

    if (queryResults.matches && queryResults.matches[0]?.score > 0.95) {
      console.log("PDF already indexed. Skipping upload.")
    }    

    if (newVectors.length > 0) {
      await index.upsert(newVectors, {
        namespace: "pdf-docs",
      });
    }

    return Response.json({
      message: "PDF indexed successfully",
      chunksIndexed: newVectors.length,
      chunks: splits.map((doc, i) => ({
        id: `doc-chunk-${i}`,
        pageContent: doc.pageContent,
        metadata: {
          source: doc.metadata?.source || "nike.pdf",
        },
      })),
    });
  } catch (error) {
    console.error("ERROR while indexing PDF:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}