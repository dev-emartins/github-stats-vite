import { BookOpen, GitBranch, MapPin } from "lucide-react";
import { Card } from "./Card";
import { CommitsChart, ContributionsChart, LanguagesChart } from "./Charts";

export function ProfileCard({ profile, contributions }) {
  return <Card className="p-5 md:p-7"><div className="grid gap-8 lg:grid-cols-[330px_minmax(0,1fr)]"><div><h2 className="text-3xl font-medium text-blue-500">{profile.login}<span className="text-slate-500"> ({profile.name || "GitHub"})</span></h2><div className="mt-8 space-y-4 text-base text-slate-400"><div className="flex items-center gap-3"><GitBranch size={24} /><span>{profile.publicRepos} Repositories</span></div><div className="flex items-center gap-3"><BookOpen size={24} /><span>Joined GitHub {profile.createdAtYear ? new Date().getFullYear() - profile.createdAtYear : "—"} years ago</span></div><div className="flex items-center gap-3"><MapPin size={24} /><span>{profile.location || "Localização não informada"}</span></div></div></div><div><div className="mb-2 text-right text-sm text-slate-500">contributions (last year)</div><ContributionsChart data={contributions} /></div></div></Card>;
}

export function CommitsCard({ commits }) {
  return <Card className="p-5 md:p-7"><h2 className="mb-5 text-3xl font-medium text-blue-500">Commits by hour (UTC)</h2><CommitsChart data={commits} /><p className="mt-1 text-right text-xs text-slate-500">from authorized repository history</p></Card>;
}

export function LanguagesCard({ languages }) {
  return <Card className="p-5 md:p-7"><h2 className="mb-5 text-3xl font-medium text-blue-500">Top Languages by Repo</h2><LanguagesChart languages={languages} /></Card>;
}