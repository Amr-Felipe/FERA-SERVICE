export default async function handler(req, res) {
  try {
   const message = req.body?.message || "Olá, teste automático";

    console.log("KEY:", process.env.GEMINI_KEY);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));

    let reply = "Sem resposta";

if (data?.candidates?.length) {
  const parts = data.candidates[0].content?.parts || [];
  reply = parts.map(p => p.text).join(" ").trim() || reply;
}

res.status(200).json({ reply });


  } catch (err) {
    console.error("ERRO REAL:", err);
    res.status(500).json({ error: err.message });
  }
}
