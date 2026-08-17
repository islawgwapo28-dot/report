export default function ChartCard({ title, children, style }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col"
      style={{ background: (style && style.bg) || "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}
    >
      <div className="text-sm font-semibold mb-3" style={{ color: (style && style.text) || "#1f2937" }}>
        {title}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}