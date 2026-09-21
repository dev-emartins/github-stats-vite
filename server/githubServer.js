import "dotenv/config";
import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 8787);
const API = "https://api.github.com";
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a", Java: "#b07219", Dart: "#00b4ab", CSS: "#563d7c",
  TypeScript: "#3178c6", HTML: "#e34c26", Python: "#3572A5", Kotlin: "#A97BFF",
  Go: "#00ADD8", Shell: "#89e051", C: "#555555", "C++": "#f34b7d",
  "C#": "#178600", PHP: "#4F5D95", Ruby: "#701516",
};
const EXCLUDED_LANGUAGES = new Set(["HTML"]);

function githubHeaders() {
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN não configurado no arquivo .env.");
  return { Accept: "application/vnd.github+json", Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" };
}

async function githubFetch(path, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { ...githubHeaders(), ...options.headers } });
  if (!response.ok) {
    if (response.status === 401) throw new Error("GITHUB_TOKEN inválido ou expirado.");
    if (response.status === 403) throw new Error("GitHub recusou a requisição. Verifique as permissões do token ou o rate limit.");
    if (response.status === 404) throw new Error(`Usuário ou recurso do GitHub não encontrado: ${path}`);
    throw new Error(`GitHub API respondeu com HTTP ${response.status}.`);
  }
  return response.json();
}

async function getAllRepositories() {
  const repositories = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await githubFetch(`/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&per_page=100&page=${page}`);
    repositories.push(...batch);
    if (batch.length < 100) break;
  }
  return repositories;
}

async function getLanguages(repositories) {
  const totals = new Map();
  await Promise.all(repositories.map(async (repo) => {
    try {
      const languages = await githubFetch(`/repos/${repo.full_name}/languages`);
      Object.entries(languages).forEach(([name, bytes]) => {
        if (!EXCLUDED_LANGUAGES.has(name)) totals.set(name, (totals.get(name) || 0) + bytes);
      });
    } catch {
      // Uma permissão individual não deve interromper os demais repositórios.
    }
  }));
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, bytes]) => ({ name, bytes, color: LANGUAGE_COLORS[name] || "#64748b" }));
}

async function getPrivateContributions() {
  const query = `query { viewer { contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`;
  const result = await githubFetch("/graphql", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
  if (result.errors?.length) throw new Error(result.errors[0].message);
  return result.data.viewer.contributionsCollection.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
}

async function getRepositoryCommits(repositories) {
  const commits = [];

  await Promise.all(repositories.map(async (repo) => {
    try {
      const batch = await githubFetch(`/repos/${repo.full_name}/commits?per_page=100`);
      batch.forEach((commit) => {
        const date = commit.commit?.author?.date || commit.commit?.committer?.date;
        if (date) commits.push({ created_at: date, payload: { distinct_size: 1 } });
      });
    } catch {
      // Repositórios sem permissão de leitura são ignorados.
    }
  }));

  return commits;
}

function buildContributions(days) {
  const months = [];
  const now = new Date();
  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({ label: date.toLocaleDateString("pt-BR", { month: "2-digit", year: "2-digit" }), month: date.getMonth(), year: date.getFullYear(), count: 0 });
  }
  days.forEach(({ date, contributionCount }) => {
    const current = new Date(`${date}T00:00:00`);
    const month = months.find((item) => item.month === current.getMonth() && item.year === current.getFullYear());
    if (month) month.count += contributionCount;
  });
  return months.map(({ label, count }) => ({ label, count }));
}

function buildCommitsByHour(events) {
  const commits = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  events.forEach((event) => {
    const hour = new Date(event.created_at).getUTCHours();
    commits[hour].count += event.payload?.distinct_size || event.payload?.size || 1;
  });
  return commits;
}

async function getStats() {
  const [profile, repositories, contributions] = await Promise.all([
    githubFetch("/user"), getAllRepositories(), getPrivateContributions(),
  ]);
  const commits = await getRepositoryCommits(repositories);
  return {
    profile: { login: profile.login, name: profile.name, location: profile.location, publicRepos: repositories.length, createdAtYear: new Date(profile.created_at).getFullYear() },
    contributions: buildContributions(contributions),
    commits: buildCommitsByHour(commits),
    languages: await getLanguages(repositories),
    meta: { repositoriesFetched: repositories.length, privateContributions: true, commitsFetched: commits.length, generatedAt: new Date().toISOString() },
  };
}

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