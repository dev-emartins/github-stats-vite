import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ContributionsTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { label, count } = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 shadow-md">
      <div className="flex flex-col">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold">
          {count} {count === 1 ? "contribuição" : "contribuições"}
        </span>
      </div>
    </div>
  );
}

function CommitsTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { hour, count } = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 shadow-md">
      <div className="flex flex-col">
        <span className="text-slate-400">{hour}</span>
        <span className="font-semibold">
          {count} {count === 1 ? "commit" : "commits"}
        </span>
      </div>
    </div>
  );
}

export function ContributionsChart({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="contributionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#23d400" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#44fc20" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#1f2937" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#475569" }}
            tickLine={false}
          />
          <YAxis
            width={28}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#475569" }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<ContributionsTooltip />}
            cursor={{ stroke: "#475569", strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#23d400"
            fill="url(#contributionFill)"
            strokeWidth={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CommitsChart({ data }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#1f2937" />
          <XAxis
            dataKey="hour"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#475569" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#475569" }}
            tickLine={false}
          />
          <Tooltip
            content={<CommitsTooltip />}
            cursor={{ fill: "#1e293b", opacity: 0.5 }}
          />
          <Bar
            dataKey="count"
            fill="#23d400"
            fillOpacity={0.6}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LanguageTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { name, color } = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span>{name}</span>
      </div>
    </div>
  );
}

export function LanguagesChart({ languages }) {
  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
      <div className="flex flex-col gap-3">
        {languages.map((language) => (
          <div
            key={language.name}
            className="flex items-center gap-2 text-sm text-slate-400"
          >
            <span
              className="h-5 w-5 rounded-sm"
              style={{ backgroundColor: language.color }}
            />
            <span>{language.name}</span>
          </div>
        ))}
      </div>
      <div className="h-52 w-52 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={languages}
              dataKey="bytes"
              nameKey="name"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={1}
            >
              {languages.map((language) => (
                <Cell key={language.name} fill={language.color} />
              ))}
            </Pie>
            <Tooltip content={<LanguageTooltip />} cursor={false} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}