import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Server } from "lucide-react";
import { getGithubStats } from "@/services/githubService";
import { Card, LoadingCard } from "@/components/Card";
import { CommitsCard, LanguagesCard, ProfileCard } from "@/components/StatisticsCards";

const FALLBACK_USERNAME = "dev-emartins";

function App() {
  const username = import.meta.env.VITE_GITHUB_USERNAME?.trim() || FALLBACK_USERNAME;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadStats(force = false) {
    try {
      setError("");
      force ? setRefreshing(true) : setLoading(true);
      setStats(await getGithubStats(username, { force }));
    } catch (err) {
      setError(err.message || "Não foi possível carregar os dados do GitHub.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, [username]);

  return (
    <main className="min-h-screen bg-[#080c12] px-4 py-6 text-slate-200 md:px-7">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Job Statistics</h1>
          <button type="button" onClick={() => loadStats(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:border-slate-600 hover:text-slate-200 disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />Atualizar
          </button>
        </div>

        {error && <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-medium">Erro ao carregar GitHub</p><p className="mt-1 text-red-400/90">{error}</p></div></div>}
        {loading && !stats ? <div className="space-y-6"><LoadingCard /><div className="grid gap-6 lg:grid-cols-2"><LoadingCard /><LoadingCard /></div></div> : stats ? <>
          <ProfileCard profile={stats.profile} contributions={stats.contributions} />
          <div className="mt-6 grid gap-6 lg:grid-cols-2"><CommitsCard commits={stats.commits} /><LanguagesCard languages={stats.languages} /></div>
          <div className="mt-8"><h2 className="mb-3 text-xl font-semibold">Data source</h2><Card className="flex items-center gap-3 p-4 text-sm text-slate-500"><Server size={18} /><span>GitHub REST + GraphQL API autenticadas e cache local. Repositórios e contribuições privadas dependem das permissões do token.</span></Card></div>
        </> : null}
      </div>
    </main>
  );
}

export default App;