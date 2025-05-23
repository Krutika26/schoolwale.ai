export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt } = body;

    console.log(`🖼️ Generating image for prompt: "${prompt}"`);

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "image/jpeg",
                "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`, // ✅ safer: store in .env
            },
            body: JSON.stringify({
                cfg_scale: 7, // Use default value if needed
                height: 1024,
                width: 1024,
                steps: 50, // Use default if needed
                seed: 0,
                safety_check: true, // ✅ valid boolean
                prompt: prompt || "A beautiful sunset over the ocean"
            }),

        }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    return new Response(JSON.stringify({ image: imageUrl }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("🔥 Error in /api/chat:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
