export default async function handler(req, res) {
  console.log("🔥 API /api/chat FOI CHAMADA");

  res.status(200).json({ reply: "API ativa" });
}


  console.log("GEMINI_KEY existe?", !!process.env.GEMINI_KEY);

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_KEY não encontrada" });
  }

  const { message } = req.body;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();

    return res.status(200).json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta"
    });

  } catch (err) {
    return res.status(500).json({ error: "Erro ao chamar Gemini" });
  }
}
