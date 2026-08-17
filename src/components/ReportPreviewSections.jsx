import { ReadOnlyTable } from "./DataTable";
import { ActivityCharts, SalesCharts, MarketingCharts } from "./Charts";
import { getActivityFields, SALES_FIELDS, MARKETING_FIELDS } from "@/lib/departments";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format";

function orderFor(report, section) {
  const order = report.sectionOrder || ["kpi", "table", "charts", "summary"];
  const index = order.indexOf(section);
  return index === -1 ? 99 : index;
}

// ---------- Activity-style (IT, HR, Operations, Inventory, Technical) ----------
export function Activity({ report, calc, c }) {
  const rows = report.data?.rows || [];
  const kpis = [
    { label: "Total Activities", value: formatNumber(calc.total), color: c.cardBg, border: c.border, text: c.text },
    { label: "Completed", value: formatNumber(calc.completed), color: c.cardBg, text: c.text },
    { label: "In Progress", value: formatNumber(calc.inProgress), color: c.cardBg, text: c.text },
    { label: "Pending", value: formatNumber(calc.pending), color: c.cardBg, text: c.text },
    { label: "Completion Rate", value: formatPercent(calc.completionRate), color: c.accent, text: "#fff" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3" style={{ order: orderFor(report, "kpi") }}>
        <KPIGrid kpis={kpis} c={c} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Critical" value={calc.priority.Critical} color={c.danger} c={c} />
          <MiniStat label="High" value={calc.priority.High} color={c.warning} c={c} />
          <MiniStat label="Medium" value={calc.priority.Medium} color="#eab308" c={c} />
          <MiniStat label="Low" value={calc.priority.Low} color="#64748b" c={c} />
        </div>
      </div>
      <Section title="Detailed Activity Log" c={c} order={orderFor(report, "table")}>
        <ReadOnlyTable fields={getActivityFields(report.department)} rows={rows} theme={{ colors: c }} />
      </Section>
      <Section title="Employee Contribution" c={c} order={orderFor(report, "summary")}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {calc.employeeContribution.map((e, i) => (
            <div key={i} className="rounded-lg p-3 flex items-center justify-between" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }}>
              <span className="text-sm font-medium">{e.name}</span>
              <span className="text-sm font-bold" style={{ color: c.accent }}>{e.count}</span>
            </div>
          ))}
        </div>
      </Section>
      {report.design?.showCharts !== false && <Section title="Analytics & Charts" c={c} order={orderFor(report, "charts")}>
        <ActivityCharts calc={calc} colors={c} />
      </Section>}
    </div>
  );
}

// ---------- Sales ----------
export function Sales({ report, calc, c }) {
  const rows = calc.rows || [];
  const kpis = [
    { label: "Total Target", value: formatCurrency(calc.totalTarget), color: c.cardBg, text: c.text },
    { label: "Total Gross", value: formatCurrency(calc.totalGross), color: c.cardBg, text: c.text },
    { label: "Total Net Sales", value: formatCurrency(calc.totalNet), color: calc.totalNet < 0 ? c.danger : c.cardBg, text: calc.totalNet < 0 ? c.danger : c.text },
    { label: "Overall Achievement", value: formatPercent(calc.overallAchievement), color: calc.overallAchievement >= 100 ? c.success : c.danger, text: "#fff" },
    { label: "Above Target", value: `${calc.aboveTarget} / ${rows.length}`, color: c.accent, text: "#fff" },
  ];
  const computedExtra = [
    { label: "Net Sales", render: (row) => <span style={{ color: row.netSales < 0 ? c.danger : c.text }}>{formatCurrency(row.netSales)}</span> },
    { label: "Achievement %", render: (row) => <span style={{ color: row.achievement < 0 ? c.danger : row.achievement >= 100 ? c.success : c.text }}>{formatPercent(row.achievement)}</span> },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3" style={{ order: orderFor(report, "kpi") }}>
        <KPIGrid kpis={kpis} c={c} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Total Credit Memo" value={formatCurrency(calc.totalCM)} color={c.warning} c={c} />
          <MiniStat label="Total Adjustments" value={formatCurrency(calc.totalAdjustments)} color={c.warning} c={c} />
          <MiniStat label="Avg Achievement" value={formatPercent(calc.avgAchievement)} color={c.accent2} c={c} />
          <MiniStat label="Below Target" value={`${calc.belowTarget} / ${rows.length}`} color={c.danger} c={c} />
        </div>
      </div>
      {calc.top && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ order: orderFor(report, "summary") }}>
          <HighlightCard label="Highest Performing" value={calc.top.salesperson} sub={`${formatPercent(calc.top.achievement)} · ${formatCurrency(calc.top.netSales)}`} color={c.success} c={c} />
          <HighlightCard label="Lowest Performing" value={(calc.bottom && calc.bottom.salesperson) || "—"} sub={calc.bottom ? `${formatPercent(calc.bottom.achievement)} · ${formatCurrency(calc.bottom.netSales)}` : "—"} color={c.danger} c={c} />
        </div>
      )}
      <Section title="Sales Performance Table" c={c} order={orderFor(report, "table")}>
        <ReadOnlyTable fields={SALES_FIELDS} rows={rows} computedExtra={computedExtra} theme={{ colors: c }} />
      </Section>
      <Section title="Sales Ranking" c={c} order={orderFor(report, "summary") + 0.1}>
        <div className="space-y-2">
          {calc.ranking.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: i === 0 ? c.accent : c.secondary, color: "#fff" }}>{r.rank}</span>
              <span className="flex-1 text-sm font-medium">{r.salesperson}</span>
              <span className="text-sm" style={{ color: c.textMuted }}>{formatCurrency(r.netSales)}</span>
              <span className="text-sm font-bold w-20 text-right" style={{ color: r.achievement >= 100 ? c.success : c.danger }}>{formatPercent(r.achievement)}</span>
            </div>
          ))}
        </div>
      </Section>
      {report.design?.showCharts !== false && <Section title="Sales Analytics" c={c} order={orderFor(report, "charts")}>
        <SalesCharts calc={calc} colors={c} />
      </Section>}
    </div>
  );
}

// ---------- Marketing ----------
export function Marketing({ report, calc, c }) {
  const rows = report.data?.rows || [];
  const kpis = [
    { label: "Weekly Logs", value: formatNumber(calc.total), color: c.cardBg, text: c.text },
    { label: "Completed", value: formatNumber(calc.completed), color: c.success, text: "#fff" },
    { label: "Pending", value: formatNumber(calc.pending), color: c.warning, text: "#fff" },
    { label: "Completion Rate", value: formatPercent(calc.completionRate), color: c.accent, text: "#fff" },
    { label: "Total Inquiries", value: formatNumber(calc.totalInquiries), color: c.cardBg, text: c.text },
    { label: "Total Sales", value: formatCurrency(calc.totalSales), color: c.cardBg, text: c.text },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3" style={{ order: orderFor(report, "kpi") }}>
        <KPIGrid kpis={kpis} c={c} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Total Leads" value={formatNumber(calc.totalLeads)} color={c.accent2} c={c} />
          <MiniStat label="Total Orders" value={formatNumber(calc.totalOrders)} color={c.accent} c={c} />
          <MiniStat label="Campaigns" value={formatNumber(calc.campaignCount)} color={c.warning} c={c} />
          <MiniStat label="Platforms" value={formatNumber(calc.platformCount)} color={c.info} c={c} />
        </div>
      </div>
      <Section title="Marketing Activity Log" c={c} order={orderFor(report, "table")}>
        <ReadOnlyTable fields={MARKETING_FIELDS} rows={rows} theme={{ colors: c }} />
      </Section>
      <Section title="Platform Activity" c={c} order={orderFor(report, "summary")}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {calc.byPlatform.map((p, i) => (
            <div key={i} className="rounded-lg p-3 flex items-center justify-between" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }}>
              <span className="text-sm font-medium truncate">{p.name}</span>
              <span className="text-sm font-bold" style={{ color: c.accent }}>{p.count}</span>
            </div>
          ))}
        </div>
      </Section>
      {report.design?.showCharts !== false && <Section title="Marketing Analytics" c={c} order={orderFor(report, "charts")}>
        <MarketingCharts calc={calc} colors={c} />
      </Section>}
    </div>
  );
}

// ---------- Custom ----------
export function Custom({ report, calc, c }) {
  const cols = report.customConfig?.columns || [];
  const rows = report.customConfig?.rows || [];
  const fields = cols.map((col) => ({
    key: col.id || col.name,
    label: col.name,
    type: col.type.toLowerCase() === "dropdown" ? "select" : col.type.toLowerCase(),
    options: col.type === "Dropdown" ? (col.options || "").split(",").map((option) => option.trim()).filter(Boolean) : undefined,
    width: "140px",
  }));
  return (
    <div className="flex flex-col gap-6">
      <div style={{ order: orderFor(report, "kpi") }}><KPIGrid kpis={[{ label: "Total Rows", value: formatNumber(calc.rowCount), color: c.accent, text: "#fff" }]} c={c} /></div>
      {cols.filter((col) => col.calc && col.calc !== "None").length > 0 && (
        <Section title="Computed Summary" c={c} order={orderFor(report, "summary")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {cols.filter((col) => col.calc && col.calc !== "None").map((col, i) => {
              const v = calc.results[col.id || col.name];
              const display = col.type === "Currency" ? formatCurrency(v)
                : col.type === "Percentage" ? formatPercent(v)
                : col.type === "Number" ? formatNumber(v)
                : v;
              return (
                <div key={i} className="rounded-lg p-3" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }}>
                  <div className="text-[11px] uppercase tracking-wide" style={{ color: c.textMuted }}>{col.name} ({col.calc})</div>
                  <div className="text-lg font-bold mt-1" style={{ color: c.accent }}>{display}</div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
      <Section title="Custom Report Data" c={c} order={orderFor(report, "table")}>
        {cols.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: c.textMuted }}>No columns defined yet.</div>
        ) : (
          <ReadOnlyTable fields={fields} rows={rows} theme={{ colors: c }} />
        )}
      </Section>
    </div>
  );
}

// ---------- shared bits ----------
function KPIGrid({ kpis, c }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((k, i) => (
        <div key={i} className="rounded-xl p-4" style={{ background: k.color, border: `1px solid ${c.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="text-[11px] uppercase tracking-wide font-medium opacity-70" style={{ color: k.text }}>{k.label}</div>
          <div className="text-xl font-bold mt-1 leading-tight" style={{ color: k.text }}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}

function MiniStat({ label, value, color, c }) {
  return (
    <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-xs" style={{ color: c.textMuted }}>{label}</span>
      <span className="text-sm font-bold ml-auto" style={{ color: c.text }}>{value}</span>
    </div>
  );
}

function HighlightCard({ label, value, sub, color, c }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
      <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: color }} />
      <div>
        <div className="text-[11px] uppercase tracking-wide" style={{ color: c.textMuted }}>{label}</div>
        <div className="text-base font-bold" style={{ color: c.text }}>{value}</div>
        <div className="text-xs" style={{ color: c.textMuted }}>{sub}</div>
      </div>
    </div>
  );
}

function Section({ title, c, children, order }) {
  return (
    <section style={{ order }}>
      <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: c.accent }}>
        <span className="w-1 h-4 rounded" style={{ background: c.accent }} />
        {title}
      </h3>
      <div className="rounded-xl p-1" style={{ background: "transparent" }}>{children}</div>
    </section>
  );
}
