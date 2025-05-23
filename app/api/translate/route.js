export async function POST(req) {
  try {
    const body = await req.json();
    const { text, targetLanguage } = body;

    if (!text || !targetLanguage) {
      return Response.json({ error: "Both 'text' and 'targetLanguage' are required." }, { status: 400 });
    }

    const endpoint = "https://api.cognitive.microsofttranslator.com"; // ✅ Or region-specific if needed
    const region = "global";
    const subscriptionKey = "8lZ2qj8FjsqsDIJTTGo1kRVuJWyW7LNWIMX8eA0u0XqSxOfC8u4bJQQJ99BEACULyCpXJ3w3AAAbACOGybJc";

    const url = `${endpoint}/translate?api-version=3.0&to=${targetLanguage}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ Text: text }])
    });

    const data = await res.json();

    const translated = data?.[0]?.translations?.[0]?.text || "Translation not found";
    return Response.json({ translated });

  } catch (err) {
    console.error("Azure Translator Error:", err);
    return Response.json({ error: "An error occurred while translating." }, { status: 500 });
  }
}
