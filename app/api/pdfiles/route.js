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
    formDataToSend.append("file_name", file.name); 
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
