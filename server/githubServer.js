import "dotenv/config";
import { createServer } from "node:http";
import { getStats } from "../api/_lib/github.js";

const PORT = Number(process.env.PORT || 8787);

const server = createServer(async (request, response) => {
  if (request.url !== "/api/github/stats" || request.method !== "GET") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Rota não encontrada." }));
    return;
  }
  try {
    const data = await getStats();
    response.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "private, max-age=300" });
    response.end(JSON.stringify(data));
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: error.message || "Falha ao consultar o GitHub." }));
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`GitHub stats API ja esta ativa na porta ${PORT}; usando a instancia existente.`);
    return;
  }

  throw error;
});

server.listen(PORT, () => console.log(`GitHub stats API em http://localhost:${PORT}`));