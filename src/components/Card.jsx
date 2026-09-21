export function Card({ children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-700/80 bg-[#0d1117] ${className}`}>
      {children}
    </section>
  );
}

export function LoadingCard({ className = "" }) {
  return (
    <Card className={`animate-pulse p-6 ${className}`}>
      <div className="h-7 w-48 rounded bg-slate-800" />
      <div className="mt-6 h-40 rounded bg-slate-900" />
    </Card>
  );
}