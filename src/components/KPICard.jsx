export default function KPICard({ label, value, sub, color, icon: Icon }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1 transition-shadow"
      style={{ background: color || "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide opacity-70 font-medium">{label}</span>
        {Icon && <Icon size={16} className="opacity-60" />}
      </div>
      <div className="text-2xl font-bold leading-tight">{value}</div>
      {sub && <div className="text-xs opacity-60">{sub}</div>}
    </div>
  );
}