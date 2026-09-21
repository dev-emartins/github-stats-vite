const CACHE_PREFIX = "github-stats:";
const DEFAULT_CACHE_MINUTES = 30;

function cacheKey(username) {
  return `${CACHE_PREFIX}${username}`;
}

function getCacheMinutes() {
  const value = Number(import.meta.env.VITE_GITHUB_CACHE_MINUTES);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CACHE_MINUTES;
}

function readCache(username, force) {
  if (force) return null;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey(username)));
    if (cached && Date.now() - cached.timestamp < getCacheMinutes() * 60 * 1000) return cached.data;
  } catch {
    // Cache invalido ou indisponivel.
  }
  return null;
}

function writeCache(username, data) {
  try {
    localStorage.setItem(cacheKey(username), JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Cache opcional: falhas de storage nao impedem a aplicacao.
  }
}

export async function getGithubStats(username, { force = false } = {}) {
  const cached = readCache(username, force);
  if (cached) return cached;

  const response = await fetch("/api/github/stats");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Nao foi possivel carregar os dados do GitHub.");

  writeCache(username, payload);
  return payload;
}
