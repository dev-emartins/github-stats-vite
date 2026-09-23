import { getStats } from "../_lib/github.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.status(404).json({ error: "Rota não encontrada." });
    return;
  }
  try {
    const data = await getStats();
    response.setHeader("Cache-Control", "private, max-age=300");
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: error.message || "Falha ao consultar o GitHub." });
  }
}
