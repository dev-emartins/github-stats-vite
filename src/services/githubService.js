const API = "https://api.github.com";
const CACHE_PREFIX = "github-stats:";
const DEFAULT_CACHE_MINUTES = 30;

const LANGUAGE_COLORS = {
  "JavaScript": "#f1e05a",
  "Java": "#b07219",
  "Dart": "#00b4ab",
  "CSS": "#563d7c",
  "TypeScript": "#3178c6",
  "HTML": "#e34c26",
  "Python": "#3572A5",
  "Kotlin": "#A97BFF",
  "Go": "#00ADD8",
  "Shell": "#89e051",
  "C": "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  "PHP": "#4F5D95",
  "Ruby": "#701516",
};

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
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age < getCacheMinutes() * 60 * 1000) {
      return cached.data;
    }
  } catch {
    // Ignore invalid local cache.
  }

  return null;
}

function writeCache(username, data) {
  try {
    localStorage.setItem(
      cacheKey(username),
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore storage quota/privacy errors.
  }
}

async function githubFetch(path) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "O GitHub limitou temporariamente as requisições públicas. Aguarde alguns minutos ou configure um backend/cache próprio."
      );
    }

    if (response.status === 404) {
      throw new Error("Usuário ou recurso do GitHub não encontrado.");
    }

    throw new Error(`GitHub API respondeu com HTTP ${response.status}.`);
  }

  return response.json();
}

async function getRepositories(username) {
  const repositories = [];
  let page = 1;

  while (true) {
    const batch = await githubFetch(
      `/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&type=owner`
    );

    repositories.push(...batch);

    if (batch.length < 100) break;
    page += 1;
  }

  return repositories;
}

async function getLanguages(repositories) {
  const totals = new Map();

  await Promise.all(
    repositories.map(async (repo) => {
      try {
        const languages = await githubFetch(
          `/repos/${repo.owner.login}/${repo.name}/languages`
        );

        Object.entries(languages).forEach(([name, bytes]) => {
          totals.set(name, (totals.get(name) || 0) + bytes);
        });
      } catch {
        // One inaccessible repository should not break the dashboard.
      }
    })
  );

  const sorted = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sorted.map(([name, bytes]) => ({
    name,
    bytes,
    color: LANGUAGE_COLORS[name] || "#64748b",
  }));
}

async function getPublicEvents(username) {
  const events = [];

  for (let page = 1; page <= 3; page += 1) {
    const batch = await githubFetch(
      `/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`
    );
    events.push(...batch);
    if (batch.length < 100) break;
  }

  return events;
}

function buildActivityByMonth(events) {
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: date.toLocaleDateString("pt-BR", {
        month: "2-digit",
        year: "2-digit",
      }),
      count: 0,
      timestamp: date.getTime(),
    });
  }

  events.forEach((event) => {
    if (event.type !== "PushEvent") return;
    const pushedAt = new Date(event.created_at);
    const match = months.find(
      (month) =>
        new Date(month.timestamp).getFullYear() === pushedAt.getFullYear() &&
        new Date(month.timestamp).getMonth() === pushedAt.getMonth()
    );

    if (match) match.count += event.payload?.distinct_size || event.payload?.size || 1;
  });

  return months.map(({ label, count }) => ({ label, count }));
}

function buildCommitsByHour(events) {
  const commits = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));

  events.forEach((event) => {
    if (event.type !== "PushEvent") return;
    const hour = new Date(event.created_at).getUTCHours();
    commits[hour].count += event.payload?.distinct_size || event.payload?.size || 1;
  });

  return commits;
}

export async function getGithubStats(username, { force = false } = {}) {
  const cached = readCache(username, force);
  if (cached) return cached;

  const profile = await githubFetch(`/users/${encodeURIComponent(username)}`);
  const repositories = await getRepositories(username);
  const languages = await getLanguages(repositories);
  const publicEvents = await getPublicEvents(username);

  const data = {
    profile: {
      login: profile.login,
      name: profile.name,
      location: profile.location,
      publicRepos: profile.public_repos,
      createdAtYear: profile.created_at
        ? new Date(profile.created_at).getFullYear()
        : null,
    },
    contributions: buildActivityByMonth(publicEvents),
    commits: buildCommitsByHour(publicEvents),
    languages,
    meta: {
      repositoriesFetched: repositories.length,
      publicEventsFetched: publicEvents.length,
      generatedAt: new Date().toISOString(),
    },
  };

  writeCache(username, data);
  return data;
}
