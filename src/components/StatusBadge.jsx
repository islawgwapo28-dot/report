export const STATUS_STYLES = {
  Completed: "bg-green-100 text-green-700 border-green-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Pending: "bg-orange-100 text-orange-700 border-orange-200",
  "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

export const PRIORITY_STYLES = {
  Low: "bg-slate-100 text-slate-600 border-slate-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
};

export default function StatusBadge({ value, kind = "status" }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const map = kind === "priority" ? PRIORITY_STYLES : STATUS_STYLES;
  const cls = map[value] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>
      {value}
    </span>
  );
}