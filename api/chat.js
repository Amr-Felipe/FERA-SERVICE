export default async function handler(req, res) {
  console.log("API chamada");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "Mensagem vazia" });
  }

  res.status(200).json({ reply: "Mensagem recebida: " + message });
}
