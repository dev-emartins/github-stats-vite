import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = { background: "#111827", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" };

export function ContributionsChart({ data }) {
  return <div className="h-64 w-full"><ResponsiveContainer><AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}><defs><linearGradient id="contributionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#1f2937" /><XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={false} /><YAxis width={28} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#contributionFill)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>;
}

export function CommitsChart({ data }) {
  return <div className="h-52 w-full"><ResponsiveContainer><BarChart data={data} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="#1f2937" /><XAxis dataKey="hour" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#475569" }} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#475569" }} tickLine={false} /><Tooltip cursor={{ fill: "#1e293b" }} contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#3fb950" fillOpacity={0.6} radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}

export function LanguagesChart({ languages }) {
  return <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center"><div className="flex flex-col gap-3">{languages.map((language) => <div key={language.name} className="flex items-center gap-2 text-sm text-slate-400"><span className="h-5 w-5 rounded-sm" style={{ backgroundColor: language.color }} /><span>{language.name}</span></div>)}</div><div className="h-52 w-52 shrink-0"><ResponsiveContainer><PieChart><Pie data={languages} dataKey="bytes" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={1}>{languages.map((language) => <Cell key={language.name} fill={language.color} />)}</Pie><Tooltip formatter={(value) => `${Number(value).toLocaleString("pt-BR")} bytes`} contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></div></div>;
}