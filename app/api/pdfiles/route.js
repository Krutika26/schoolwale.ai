import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { pinecone } from "../../../lib/pinecone-client"; // Adjust path if needed
import { pipeline } from "@xenova/transformers";
import { writeFile } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFilePath = path.join(tmpdir(), `${randomUUID()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    const loader = new PDFLoader(tempFilePath);
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
          id: `doc-chunk-${i}-${randomUUID()}`, // Ensures uniqueness
          values: Array.from(embeddingTensor.data),
          metadata: {
            text: doc.pageContent,
            source: file.name,
          },
        };
      })
    );

    const index = pinecone.Index(process.env.PINECONE_INDEX);

    // Optional: check if content exists (basic check via score similarity)
    const queryResults = await index.query({
      vector: vectors[0].values,
      topK: 1,
      includeMetadata: true,
    });
    console.log("Sources found:", queryResults.matches.map(m => m.metadata?.source));

    const similarScore = queryResults.matches?.[0]?.score || 0;

    if (similarScore > 0.95) {
      console.log("PDF already indexed. Skipping upload.");
    } else {
      const upsertResponse = await index.upsert(vectors, "pdf-docs");
      console.log("Upsert response:", upsertResponse);
    }

    return new Response(
      JSON.stringify({
        message: "PDF indexed successfully",
        chunksIndexed: vectors.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("ERROR while indexing PDF:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}