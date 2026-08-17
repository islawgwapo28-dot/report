import {
  Banknote, BarChart3, CalendarDays, CheckCircle2, ClipboardList, Flag,
  Lightbulb, MessageCircle, ShoppingCart, Target, Timer, Users,
} from "lucide-react";
import { buildExecutiveSummary, pluralize } from "@/lib/calc";
import { dateRangeText, formatCompactCurrency, formatCurrency, formatNumber, formatPercent } from "@/lib/format";

// Wide management-screen canvas matching the requested 1672 x 941 reference.
// PDF export scales this presentation canvas down to A4 landscape without changing data.
const CANVAS_WIDTH = 1672;
const CANVAS_HEIGHT = 941;

export default function OnePageReport({ report, calc, theme, forwardRef }) {
  const c = theme.colors;
  const radius = theme.visual?.radius ?? 8;
  const fontFamily = { Inter: "Inter, ui-sans-serif, system-ui, sans-serif", Arial: "Arial, Helvetica, sans-serif", Georgia: "Georgia, 'Times New Roman', serif" }[report.design?.fontFamily || "Inter"];
  const content = getDepartmentContent(report, calc, c);
  const canvasPadding = 12;
  const canvasGap = 10;
  const headerHeight = 92;
  const kpiHeight = 132;
  const footerHeight = 96;
  const mainHeight = CANVAS_HEIGHT - (canvasPadding * 2) - (canvasGap * 3) - headerHeight - kpiHeight - footerHeight;

  return (
    <article ref={forwardRef} className="report-sheet" data-template={theme.id} style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, boxSizing: "border-box", overflow: "visible", display: "grid", gridTemplateRows: `${headerHeight}px ${kpiHeight}px ${mainHeight}px ${footerHeight}px`, gap: canvasGap, padding: canvasPadding, background: c.bg, color: c.text, fontFamily }}>
      <ReportHeader report={report} c={c} radius={radius} />
      <section style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: canvasGap }}>
        {content.kpis.map((kpi, index) => <KpiCard key={`${kpi.label}-${index}`} {...kpi} c={c} radius={radius} shadow={theme.visual?.shadow} />)}
      </section>
      <section style={{ minHeight: 0, display: "grid", alignItems: "start", gridTemplateColumns: "minmax(0, 3.15fr) minmax(320px, 1fr)", gap: canvasGap }}>
        <Panel title={content.tableTitle} c={c} radius={radius} style={{ minHeight: 0, height: mainHeight }}><div style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}><CompactTable content={content} c={c} /><div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>{content.insights}</div></div></Panel>
        <aside style={{ minHeight: 0, display: "grid", gridTemplateRows: "repeat(3, minmax(0, 1fr))", gap: canvasGap }}>
          {content.analytics.map((item, index) => <Panel key={`${item.title}-${index}`} title={item.title} c={c} radius={radius} compact>{item.node}</Panel>)}
        </aside>
      </section>
      <footer style={{ display: "grid", gridTemplateColumns: "48px minmax(0, 1fr)", alignItems: "center", gap: 10, minHeight: footerHeight, padding: "10px 13px", borderRadius: radius, border: `1px solid ${c.border}`, background: c.cardBg, boxShadow: theme.visual?.shadow }}>
        <div style={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: Math.max(4, radius - 2), background: c.cardBgAlt, color: c.warning }}><Lightbulb size={20} /></div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: c.accent, fontSize: 12, lineHeight: 1.2, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>Executive Summary</div>
          <div style={{ color: c.text, fontSize: 12.5, lineHeight: 1.45, overflowWrap: "anywhere" }}>{report.design?.showExecutiveSummary === false ? "Executive summary is hidden in report settings." : buildExecutiveSummary(report, calc)}</div>
        </div>
      </footer>
    </article>
  );
}

function ReportHeader({ report, c, radius }) {
  const period = effectiveReportPeriod(report) || "No period selected";
  const department = displayTitle(report.info?.department || report.department || "Department not selected");
  return (
    <header style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0, minHeight: 92, padding: "13px 18px", borderRadius: radius, border: `1px solid ${c.border}`, background: c.headerBg, color: c.headerText }}>
      <div style={{ width: 62, height: 66, display: "grid", placeItems: "center", flex: "0 0 auto", borderRight: `1px solid ${c.border}`, paddingRight: 14 }}>
        {report.design?.showLogo !== false && report.info?.companyLogo ? <img src={report.info.companyLogo} alt="WPCC logo" style={{ width: 54, height: 54, objectFit: "contain" }} /> : <div style={{ width: 48, height: 48, display: "grid", placeItems: "center", borderRadius: 7, background: c.accent, color: "#fff", fontSize: 17, fontWeight: 900, letterSpacing: "-.05em" }}>WPCC</div>}
      </div>
      <div style={{ minWidth: 0, flex: 1, paddingRight: 6 }}>
        <div style={{ fontSize: 20, lineHeight: 1.2, fontWeight: 850, letterSpacing: ".01em", overflowWrap: "anywhere" }}>{report.info?.companyName || "WELD POWERTOOLS & CONSTRUCTION CORPORATION"}</div>
        <div style={{ color: c.accent, fontSize: 15, lineHeight: 1.25, fontWeight: 700, marginTop: 4, overflowWrap: "anywhere" }}>{normalizeReportTitle(report.info?.reportTitle)}</div>
        <div style={{ opacity: .78, fontSize: 9, lineHeight: 1.3, marginTop: 3, overflowWrap: "anywhere" }}>{normalizeBranchLabel(report.info?.branch)} · Prepared by {displayName(report.info?.preparedBy || "-")}</div>
      </div>
      <MetaBlock icon={<CalendarDays size={17} />} label="Report Period" value={period} c={c} />
      <div style={{ alignSelf: "stretch", width: 1, background: c.border }} />
      <MetaBlock icon={<Users size={17} />} label="Department / Team" value={department} c={c} />
    </header>
  );
}

function MetaBlock({ icon, label, value, c }) {
  return <div style={{ minWidth: 220, maxWidth: 280, display: "grid", gridTemplateColumns: "28px minmax(0,1fr)", gap: 9, alignItems: "center" }}><span style={{ color: c.headerText, opacity: .9 }}>{icon}</span><span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 10, lineHeight: 1.2, letterSpacing: ".13em", textTransform: "uppercase", opacity: .68 }}>{label}</span><span style={{ display: "block", marginTop: 4, fontSize: 14, lineHeight: 1.3, fontWeight: 700, overflowWrap: "anywhere" }}>{value}</span></span></div>;
}

function KpiCard({ label, value, sub, color, icon: Icon, progress, c, radius, shadow, danger }) {
  const tone = danger ? c.danger : color || c.accent;
  const pct = Math.max(0, Math.min(100, Number(progress) || 0));
  return <div style={{ minHeight: 132, display: "grid", gridTemplateColumns: "48px minmax(0,1fr)", gridTemplateRows: "minmax(0,1fr) 5px", gap: "10px 12px", alignItems: "start", padding: "16px 17px 14px", borderRadius: radius, border: `1px solid ${c.border}`, background: c.cardBg, boxShadow: shadow }}><div style={{ width: 43, height: 43, display: "grid", placeItems: "center", borderRadius: "50%", background: `${tone}22`, color: tone }}><Icon size={23} /></div><div style={{ minWidth: 0 }}><div style={{ color: c.text, opacity: .92, fontSize: 12, lineHeight: 1.2, fontWeight: 800, letterSpacing: ".045em", textTransform: "uppercase", overflowWrap: "anywhere" }}>{label}</div><div style={{ color: tone, fontSize: String(value).length > 14 ? 23 : 34, lineHeight: 1.15, fontWeight: 850, marginTop: 6, overflowWrap: "anywhere" }}>{value}</div><div style={{ color: c.textMuted, fontSize: 11, lineHeight: 1.35, marginTop: 5, overflowWrap: "anywhere" }}>{sub}</div></div><div style={{ gridColumn: "1 / -1", width: "100%", height: 5, borderRadius: 9, background: c.border }}><span style={{ display: "block", width: `${pct}%`, height: "100%", borderRadius: 9, background: tone }} /></div></div>;
}

function Panel({ title, c, radius, children, compact = false, style = {} }) {
  return <div style={{ ...style, display: "flex", flexDirection: "column", borderRadius: radius, border: `1px solid ${c.border}`, background: c.cardBg }}><div style={{ flex: "0 0 auto", minHeight: compact ? 41 : 44, display: "flex", alignItems: "center", padding: compact ? "10px 14px 8px" : "11px 16px 9px", borderBottom: `1px solid ${c.border}`, color: c.text, fontSize: compact ? 11 : 12, lineHeight: 1.25, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", overflowWrap: "anywhere" }}>{title}</div><div style={{ flex: 1, minHeight: 0 }}>{children}</div></div>;
}

function CompactTable({ content, c }) {
  const visible = content.rows.slice(0, content.maxRows);
  const hidden = Math.max(0, content.rows.length - visible.length);
  if (!content.columns.length) return <div style={{ minHeight: 120, display: "grid", placeItems: "center", color: c.textMuted, fontSize: 11, lineHeight: 1.4, padding: 18, textAlign: "center" }}>Add columns and rows to build this custom report.</div>;
  return <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}><table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: 11 }}><colgroup>{content.columns.map((column) => <col key={column.key} style={{ width: column.width }} />)}</colgroup><thead><tr>{content.columns.map((column) => <th key={column.key} style={{ minHeight: 38, padding: "9px 11px", textAlign: column.align || "left", borderBottom: `1px solid ${c.border}`, background: c.cardBgAlt, color: c.textMuted, fontSize: 9.5, lineHeight: 1.25, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", overflowWrap: "anywhere" }}>{column.label}</th>)}</tr></thead><tbody>{visible.length ? visible.map((row, rowIndex) => <tr key={row.id || rowIndex} style={{ background: rowIndex % 2 ? c.cardBgAlt : c.cardBg }}>{content.columns.map((column) => <td key={column.key} style={{ minHeight: content.rowHeight, padding: "9px 11px", borderBottom: `1px solid ${c.border}`, textAlign: column.align || "left", verticalAlign: "middle", color: c.text, lineHeight: 1.4, overflowWrap: "anywhere" }}>{column.render ? column.render(row, c) : <CellText value={row[column.key]} muted={column.muted} c={c} />}</td>)}</tr>) : <tr><td colSpan={content.columns.length} style={{ padding: "34px 18px", textAlign: "center", color: c.textMuted, lineHeight: 1.4 }}>No report data entered yet.</td></tr>}</tbody></table>{hidden > 0 && <div style={{ flex: "0 0 auto", minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center", color: c.textMuted, background: c.cardBgAlt, borderTop: `1px solid ${c.border}`, padding: "6px 10px", fontSize: 9, lineHeight: 1.3, textAlign: "center" }}>Showing {visible.length} of {content.rows.length} records · {hidden} additional record{hidden === 1 ? "" : "s"} included in all calculations and charts</div>}</div>;
}

function CellText({ value, muted = false, c }) { return <div style={{ color: muted ? c.textMuted : c.text, whiteSpace: "normal", overflowWrap: "anywhere" }}>{value == null || value === "" ? "-" : String(value)}</div>; }
function StatusPill({ value, c }) { const normalized = String(value || "").trim().toLowerCase(); const tone = normalized === "completed" ? c.success : normalized === "in progress" ? c.info : normalized === "pending" || normalized === "on hold" ? c.warning : normalized === "cancelled" ? c.danger : c.textMuted; return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, minHeight: 23, maxWidth: "100%", padding: "3px 7px", borderRadius: 4, border: `1px solid ${tone}88`, color: tone, fontWeight: 700, lineHeight: 1.2, whiteSpace: "normal" }}><i style={{ flex: "0 0 auto", width: 6, height: 6, borderRadius: "50%", background: tone }} />{value || "-"}</span>; }
function PriorityText({ value, c }) { const normalized = String(value || "").trim().toLowerCase(); const tone = normalized === "critical" ? c.danger : normalized === "high" ? c.warning : normalized === "medium" ? "#d3a31e" : c.success; return <span style={{ color: tone, fontWeight: 800, lineHeight: 1.25, textTransform: "uppercase", overflowWrap: "anywhere" }}>{value || "-"}</span>; }

function EmptyState({ text, c }) { return <div style={{ minHeight: 120, height: "100%", display: "grid", placeItems: "center", padding: 18, textAlign: "center", color: c.textMuted, fontSize: 11, lineHeight: 1.4 }}>{text}</div>; }
function Snapshot({ title, items, c }) {
  return <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", padding: "16px 26px 18px" }}><div style={{ color: c.accent, fontSize: 12, lineHeight: 1.2, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>{title}</div><div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, minmax(0, 1fr))`, gap: 11 }}>{items.map((item) => <div key={item.label} style={{ minHeight: 78, padding: "13px 14px", borderRadius: 7, border: `1px solid ${c.border}`, background: c.cardBgAlt }}><div style={{ color: c.textMuted, fontSize: 10, lineHeight: 1.25, textTransform: "uppercase", letterSpacing: ".06em" }}>{item.label}</div><div style={{ color: item.color || c.text, fontSize: 19, lineHeight: 1.2, fontWeight: 800, marginTop: 8, overflowWrap: "anywhere" }}>{item.value}</div></div>)}</div></div>;
}

function DonutSummary({ data, total, c, centerLabel = "TOTAL", emptyText = "No chart data available" }) {
  if (!total || !data.some((item) => item.value > 0)) return <EmptyState text={emptyText} c={c} />;
  const valid = data.filter((item) => item.value > 0);
  const denominator = Math.max(1, valid.reduce((sum, item) => sum + item.value, 0));
  const circumference = 2 * Math.PI * 34;
  let offset = 0;
  const segments = valid.map((item) => {
    const length = (Number(item.value) / denominator) * circumference;
    const segment = { ...item, length, offset };
    offset += length;
    return segment;
  });
  return <div style={{ minHeight: 140, display: "grid", gridTemplateColumns: "112px minmax(0,1fr)", alignItems: "center", gap: 12, padding: "12px 16px" }}><div style={{ width: 96, height: 96, margin: "auto", position: "relative", display: "grid", placeItems: "center" }}><svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label={`${centerLabel}: ${formatNumber(total)}`} style={{ display: "block", transform: "rotate(-90deg)" }}><circle cx="48" cy="48" r="34" fill="none" stroke={c.cardBgAlt} strokeWidth="12" />{segments.map((item) => <circle key={item.label} cx="48" cy="48" r="34" fill="none" stroke={item.color} strokeWidth="12" strokeDasharray={`${item.length} ${circumference - item.length}`} strokeDashoffset={-item.offset} />)}</svg><div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}><span><b style={{ display: "block", color: c.text, fontSize: 23, lineHeight: 1 }}>{formatNumber(total)}</b><small style={{ display: "block", color: c.textMuted, fontSize: 8, lineHeight: 1.2, marginTop: 5 }}>{centerLabel}</small></span></div></div><div style={{ minWidth: 0 }}>{data.slice(0, 4).map((item) => <div key={item.label} style={{ display: "grid", gridTemplateColumns: "8px minmax(0,1fr) auto", alignItems: "center", gap: 8, margin: "7px 0", color: c.text, fontSize: 11, lineHeight: 1.25 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} /><span style={{ overflowWrap: "anywhere" }}>{item.label}</span><b>{formatNumber(item.value)}</b></div>)}</div></div>;
}

function HorizontalBars({ data, c, valueFormatter = formatNumber }) {
  if (!data.length) return <EmptyState text="No team contribution data" c={c} />;
  const max = Math.max(1, ...data.map((item) => Math.abs(Number(item.value) || 0)));
  return <div style={{ minHeight: 140, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>{data.slice(0, 5).map((item, index) => <div key={`${item.label}-${index}`} style={{ display: "grid", gridTemplateColumns: "116px minmax(0,1fr) auto", gap: 9, alignItems: "center", color: c.text, fontSize: 11, lineHeight: 1.25 }}><span style={{ overflowWrap: "anywhere", fontWeight: 650 }}>{item.label}</span><span style={{ height: 16, borderRadius: 3, background: c.cardBgAlt }}><i style={{ display: "block", width: `${Math.max(2, Math.abs(Number(item.value) || 0) / max * 100)}%`, height: "100%", background: item.color || c.accent, borderRadius: 3 }} /></span><b style={{ minWidth: 44, textAlign: "right", whiteSpace: "nowrap" }}>{valueFormatter(item.value)}</b></div>)}</div>;
}

function VerticalBars({ data, c, valueKey = "value", valueFormatter = formatNumber }) {
  if (!data.length) return <EmptyState text="No activity data available" c={c} />;
  const max = Math.max(1, ...data.map((item) => Math.abs(Number(item[valueKey]) || 0)));
  return <div style={{ minHeight: 140, display: "flex", alignItems: "stretch", justifyContent: "center", gap: 9, padding: "12px 16px 9px" }}>{data.slice(-7).map((item, index) => { const value = Number(item[valueKey]) || 0; const barWidth = data.length === 1 ? 62 : "72%"; return <div key={`${item.label}-${index}`} style={{ flex: data.length === 1 ? "0 0 112px" : 1, minWidth: 0, display: "grid", gridTemplateRows: "22px minmax(70px,1fr) auto", gap: 4, textAlign: "center" }}><b style={{ color: c.text, fontSize: 10, lineHeight: 1.2 }}>{valueFormatter(value)}</b><span style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}><i style={{ display: "block", width: barWidth, maxWidth: 92, minHeight: 4, height: `${Math.max(4, Math.abs(value) / max * 100)}%`, borderRadius: "3px 3px 1px 1px", background: item.color || c.accent2 }} /></span><span style={{ color: c.textMuted, fontSize: 10, lineHeight: 1.25, overflowWrap: "anywhere" }}>{item.label}</span></div>; })}</div>;
}

function getDepartmentContent(report, calc, c) { if (report.department === "Sales") return salesContent(calc, c); if (report.department === "Marketing / Online Sales") return marketingContent(calc, c); if (report.department === "Custom Report") return customContent(report, calc, c); return activityContent(calc, c); }

function activityContent(calc, c) {
  const rows = calc.rows || [];
  const reportDays = new Set(rows.map((row) => row.date).filter(Boolean)).size;
  const highPriority = calc.priority.High;
  return { tableTitle: "Detailed Activity Log", rows, maxRows: 12, rowHeight: 34, tableHeight: Math.min(474, 37 + 31 + Math.max(1, Math.min(rows.length, 12)) * 34 + (rows.length > 12 ? 24 : 0)), columns: [
    { key: "date", label: "Date", width: "12%", render: (row) => <DateCell value={row.date} c={c} /> },
    { key: "employee", label: "Name", width: "14%", render: (row) => <EmployeeCell value={row.employee} c={c} /> },
    { key: "duty", label: "Duty / Monitoring Area", width: "20%", render: (row) => <CellText value={displayTitle(row.duty)} c={c} /> },
    { key: "activity", label: "Activity / Task", width: "28%", render: (row) => <StackedCell main={displayTitle(row.activity)} sub={displayTitle(row.description)} c={c} /> },
    { key: "status", label: "Status", width: "15%", render: (row) => <StatusPill value={row.status} c={c} /> },
    { key: "priority", label: "Priority", width: "11%", render: (row) => <PriorityText value={row.priority} c={c} /> },
  ], kpis: [
    { label: "Total Activities", value: formatNumber(calc.total), sub: `Logged across ${reportDays} ${pluralize(reportDays, "report day", "report days")}`, color: c.warning, icon: ClipboardList, progress: calc.total ? 100 : 0 },
    { label: "Completed", value: formatNumber(calc.completed), sub: `${calc.completed} of ${calc.total} ${pluralize(calc.total, "activity", "activities")} closed`, color: c.success, icon: CheckCircle2, progress: calc.completionRate },
    { label: "In Progress", value: formatNumber(calc.inProgress), sub: `${calc.inProgress} of ${calc.total} ${pluralize(calc.total, "activity", "activities")} open`, color: c.info, icon: Timer, progress: calc.total ? calc.inProgress / calc.total * 100 : 0 },
    { label: "Completion Rate", value: formatPercent(calc.completionRate), sub: `${calc.completed} completed of ${calc.total} total`, color: c.accent, icon: BarChart3, progress: calc.completionRate },
    { label: "High Priority", value: formatNumber(highPriority), sub: `${highPriority} ${pluralize(highPriority, "task", "tasks")} rated high priority`, color: c.warning, icon: Flag, progress: calc.total ? highPriority / calc.total * 100 : 0 },
  ], insights: rows.length <= 8 ? <Snapshot title="Performance Snapshot" c={c} items={[{ label: "Report coverage", value: `${reportDays} ${pluralize(reportDays, "day", "days")}` }, { label: "Active work", value: `${calc.inProgress + calc.pending} ${pluralize(calc.inProgress + calc.pending, "item", "items")}`, color: c.info }, { label: "Priority mix", value: `${calc.priority.High} high · ${calc.priority.Medium} medium`, color: c.warning }]} /> : null, analytics: [
    { title: "Task Status Overview", node: <DonutSummary total={calc.total} emptyText="No task status data" c={c} data={[{ label: "Completed", value: calc.completed, color: c.success }, { label: "In Progress", value: calc.inProgress, color: c.info }, { label: "Pending", value: calc.pending, color: c.warning }, { label: "Other", value: calc.onHold + calc.cancelled, color: c.danger }]} /> },
    { title: "Team Member Contribution", node: <HorizontalBars c={c} data={calc.employeeContribution.map((item, index) => ({ label: displayName(item.name), value: item.count, color: c.chartColors[index % c.chartColors.length] }))} valueFormatter={(value) => `${formatNumber(value)} ${pluralize(value, "task", "tasks")}`} /> },
    { title: "Activities by Date", node: <VerticalBars c={c} data={calc.perDate.map((item) => ({ label: shortDate(item.date), value: item.count, color: c.accent2 }))} /> },
  ] };
}

function salesContent(calc, c) {
  const rows = calc.rows || [];
  const positiveNetSales = rows.filter((row) => row.netSales > 0).reduce((sum, row) => sum + row.netSales, 0);
  return { tableTitle: "Sales Performance by Salesperson", rows, maxRows: 10, rowHeight: 36, tableHeight: Math.min(474, 37 + 31 + Math.max(1, Math.min(rows.length, 10)) * 36 + (rows.length > 10 ? 24 : 0)), columns: [
    { key: "salesperson", label: "Salesperson", width: "18%", render: (row) => <EmployeeCell value={row.salesperson} c={c} /> },
    { key: "quota", label: "Target", width: "15%", align: "right", render: (row) => <Money value={row.quota} c={c} /> },
    { key: "grossSales", label: "Gross Sales", width: "16%", align: "right", render: (row) => <Money value={row.grossSales} c={c} /> },
    { key: "creditMemo", label: "Credit Memo", width: "14%", align: "right", render: (row) => <Money value={row.creditMemo} c={c} /> },
    { key: "returns", label: "Adjustments", width: "14%", align: "right", render: (row) => <Money value={row.returns} c={c} /> },
    { key: "netSales", label: "Net Sales", width: "15%", align: "right", render: (row) => <Money value={row.netSales} c={c} strong /> },
    { key: "achievement", label: "Achievement", width: "12%", align: "right", render: (row) => <Percent value={row.achievement} c={c} /> },
  ], kpis: [
    { label: "Target Sales", value: formatCompactCurrency(calc.totalTarget), sub: formatCurrency(calc.totalTarget), color: c.info, icon: Target, progress: 100 },
    { label: "Gross Sales", value: formatCompactCurrency(calc.totalGross), sub: formatCurrency(calc.totalGross), color: c.accent2, icon: Banknote, progress: calc.totalTarget ? calc.totalGross / calc.totalTarget * 100 : 0 },
    { label: "Net Sales", value: formatCompactCurrency(calc.totalNet), sub: `After ${formatCompactCurrency(calc.totalCM + calc.totalAdjustments)} deductions`, color: calc.totalNet < 0 ? c.danger : c.success, icon: BarChart3, progress: calc.overallAchievement, danger: calc.totalNet < 0 },
    { label: "Overall Achievement", value: formatPercent(calc.overallAchievement), sub: "Net sales ÷ total target", color: calc.overallAchievement >= 100 ? c.success : c.warning, icon: CheckCircle2, progress: calc.overallAchievement, danger: calc.overallAchievement < 0 },
    { label: "Above Target", value: `${calc.aboveTarget} / ${rows.length}`, sub: `${calc.belowTarget} ${pluralize(calc.belowTarget, "salesperson", "salespeople")} below target`, color: c.warning, icon: Users, progress: rows.length ? calc.aboveTarget / rows.length * 100 : 0 },
  ], insights: rows.length <= 8 ? <Snapshot title="Sales Snapshot" c={c} items={[{ label: "Top performer", value: displayName(calc.top?.salesperson || "-") }, { label: "Average achievement", value: formatPercent(calc.avgAchievement), color: c.accent }, { label: "Target coverage", value: `${calc.aboveTarget} of ${rows.length} above`, color: c.success }]} /> : null, analytics: [
    { title: "Net Sales Contribution", node: <DonutSummary total={positiveNetSales} centerLabel="NET SALES" c={c} data={rows.filter((row) => row.netSales > 0).map((row, index) => ({ label: row.salesperson || "Unassigned", value: row.netSales, color: c.chartColors[index % c.chartColors.length] }))} /> },
    { title: "Sales Ranking", node: <HorizontalBars c={c} data={calc.ranking.map((row, index) => ({ label: `${row.rank}. ${row.salesperson || "Unassigned"}`, value: row.achievement, color: row.achievement >= 100 ? c.success : c.chartColors[index % c.chartColors.length] }))} valueFormatter={(value) => formatPercent(value, 1)} /> },
    { title: "Quota vs Actual", node: <HorizontalBars c={c} data={calc.ranking.map((row) => ({ label: row.salesperson || "Unassigned", value: row.netSales, color: row.netSales >= row.quota ? c.success : c.accent2 }))} valueFormatter={formatCompactCurrency} /> },
  ] };
}

function marketingContent(calc, c) {
  const rows = calc.rows || [];
  return { tableTitle: "Marketing & Online Sales Activity Log", rows, maxRows: 10, rowHeight: 36, tableHeight: Math.min(474, 37 + 31 + Math.max(1, Math.min(rows.length, 10)) * 36 + (rows.length > 10 ? 24 : 0)), columns: [
    { key: "date", label: "Date", width: "11%", render: (row) => <DateCell value={row.date} c={c} /> },
    { key: "activity", label: "Main Activity", width: "21%", render: (row) => <StackedCell main={displayTitle(row.activity)} sub={displayTitle(row.product)} c={c} /> },
    { key: "platform", label: "Platform", width: "14%", render: (row) => <CellText value={displayTitle(row.platform)} c={c} /> }, { key: "campaignType", label: "Campaign", width: "20%", render: (row) => <CellText value={displayTitle(row.campaignType)} c={c} /> },
    { key: "inquiries", label: "Inquiries", width: "9%", align: "right" }, { key: "orders", label: "Orders", width: "8%", align: "right" },
    { key: "salesAmount", label: "Sales", width: "11%", align: "right", render: (row) => <Money value={row.salesAmount} c={c} /> }, { key: "status", label: "Status", width: "13%", render: (row) => <StatusPill value={row.status} c={c} /> },
  ], kpis: [
    { label: "Weekly Logs", value: formatNumber(calc.total), sub: `${calc.campaignCount} ${pluralize(calc.campaignCount, "campaign type", "campaign types")}`, color: c.info, icon: ClipboardList, progress: calc.total ? 100 : 0 },
    { label: "Completed", value: formatNumber(calc.completed), sub: `${calc.completed} of ${calc.total} ${pluralize(calc.total, "activity", "activities")} closed`, color: c.success, icon: CheckCircle2, progress: calc.completionRate },
    { label: "Completion Rate", value: formatPercent(calc.completionRate), sub: `${calc.inProgress + calc.pending} active or pending`, color: c.accent, icon: BarChart3, progress: calc.completionRate },
    { label: "Inquiries / Orders", value: `${formatNumber(calc.totalInquiries)} / ${formatNumber(calc.totalOrders)}`, sub: `${formatNumber(calc.totalLeads)} qualified leads`, color: c.warning, icon: MessageCircle, progress: calc.totalInquiries ? calc.totalOrders / calc.totalInquiries * 100 : 0 },
    { label: "Total Sales", value: formatCompactCurrency(calc.totalSales), sub: formatCurrency(calc.totalSales), color: c.success, icon: ShoppingCart, progress: calc.totalSales ? 100 : 0 },
  ], insights: rows.length <= 8 ? <Snapshot title="Campaign Snapshot" c={c} items={[{ label: "Platforms", value: formatNumber(calc.platformCount) }, { label: "Qualified leads", value: formatNumber(calc.totalLeads), color: c.info }, { label: "Order conversion", value: calc.totalInquiries ? formatPercent(calc.totalOrders / calc.totalInquiries * 100) : "0%", color: c.success }]} /> : null, analytics: [
    { title: "Platform Usage", node: <DonutSummary total={calc.total} emptyText="No platform activity data" centerLabel="ACTIVITY" c={c} data={calc.byPlatform.map((item, index) => ({ label: item.name, value: item.count, color: c.chartColors[index % c.chartColors.length] }))} /> },
    { title: "Campaign Distribution", node: <HorizontalBars c={c} data={calc.byCampaign.map((item, index) => ({ label: item.name, value: item.count, color: c.chartColors[index % c.chartColors.length] }))} /> },
    { title: "Daily Sales Performance", node: <VerticalBars c={c} data={calc.byDate.map((item) => ({ label: shortDate(item.date), value: item.sales, color: c.accent2 }))} valueFormatter={formatCompactCurrency} /> },
  ] };
}

function customContent(report, calc, c) {
  const configured = report.customConfig?.columns || [];
  const visibleColumns = configured.slice(0, 6);
  const computed = configured.filter((column) => column.calc && column.calc !== "None");
  const kpis = [{ label: "Total Records", value: formatNumber(calc.rowCount), sub: `${configured.length} configured ${pluralize(configured.length, "column", "columns")}`, color: c.info, icon: ClipboardList, progress: calc.rowCount ? 100 : 0 }];
  computed.slice(0, 4).forEach((column, index) => { const value = calc.results[column.id || column.name]; kpis.push({ label: `${column.name} · ${column.calc}`, value: formatCustomValue(value, column.type), sub: `Automatic ${String(column.calc).toLowerCase()}`, color: c.chartColors[index % c.chartColors.length], icon: BarChart3, progress: value ? 100 : 0 }); });
  while (kpis.length < 5) kpis.push({ label: "Available Metric", value: "-", sub: "Assign a column calculation", color: c.textMuted, icon: Target, progress: 0 });
  return { tableTitle: "Custom Report Data", rows: calc.rows || [], maxRows: 10, rowHeight: 36, tableHeight: Math.min(474, 37 + 31 + Math.max(1, Math.min((calc.rows || []).length, 10)) * 36), columns: visibleColumns.map((column) => ({ key: column.id || column.name, label: column.name || "Untitled", width: `${100 / Math.max(1, visibleColumns.length)}%`, render: (row) => <CellText value={formatCustomValue(row[column.id || column.name], column.type, false)} c={c} /> })), insights: (calc.rows || []).length <= 8 ? <Snapshot title="Custom Report Snapshot" c={c} items={[{ label: "Configured columns", value: formatNumber(configured.length) }, { label: "Calculated fields", value: formatNumber(computed.length), color: c.accent }, { label: "Records", value: formatNumber(calc.rowCount), color: c.info }]} /> : null, kpis: kpis.slice(0, 5), analytics: [
    { title: "Computed Summary", node: <HorizontalBars c={c} data={computed.slice(0, 5).map((column, index) => ({ label: column.name, value: Number(calc.results[column.id || column.name]) || 0, color: c.chartColors[index % c.chartColors.length] }))} /> },
    { title: "Report Structure", node: <DonutSummary total={configured.length} emptyText="No custom columns configured" centerLabel="COLUMNS" c={c} data={Object.entries(configured.reduce((map, column) => ({ ...map, [column.type]: (map[column.type] || 0) + 1 }), {})).map(([label, value], index) => ({ label, value, color: c.chartColors[index % c.chartColors.length] }))} /> },
    { title: "Report Coverage", node: <VerticalBars c={c} data={(calc.rows || []).slice(0, 7).map((row, index) => ({ label: `Row ${index + 1}`, value: Object.values(row).filter((value) => value !== "" && value != null).length, color: c.accent2 }))} /> },
  ] };
}

function DateCell({ value, c }) { if (!value) return <CellText value="-" c={c} />; const date = new Date(`${value}T00:00:00`); if (Number.isNaN(date.getTime())) return <CellText value={value} c={c} />; return <div><b style={{ display: "block", color: c.accent, fontSize: 8, lineHeight: 1.2, textTransform: "uppercase" }}>{date.toLocaleDateString("en-PH", { weekday: "short" })}</b><span style={{ display: "block", marginTop: 2, color: c.text, fontWeight: 700, lineHeight: 1.25 }}>{date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span></div>; }
function EmployeeCell({ value, c }) { const name = displayName(value || "Unassigned"); return <div style={{ display: "flex", alignItems: "flex-start", gap: 6, minWidth: 0 }}><span style={{ flex: "0 0 auto", width: 21, height: 21, display: "grid", placeItems: "center", borderRadius: "50%", background: c.accent2, color: "#fff", fontSize: 8, fontWeight: 800 }}>{name.trim().charAt(0).toUpperCase() || "?"}</span><b style={{ lineHeight: 1.3, overflowWrap: "anywhere" }}>{name}</b></div>; }
function StackedCell({ main, sub, c }) { return <div style={{ minWidth: 0 }}><b style={{ display: "block", color: c.text, lineHeight: 1.3, overflowWrap: "anywhere" }}>{main || "-"}</b>{sub && <span style={{ display: "block", color: c.textMuted, fontSize: 8, lineHeight: 1.3, marginTop: 2, overflowWrap: "anywhere" }}>{sub}</span>}</div>; }
function Money({ value, c, strong = false }) { const number = Number(value) || 0; return <span style={{ color: number < 0 ? c.danger : c.text, fontWeight: strong ? 800 : 600, whiteSpace: "nowrap" }}>{formatCurrency(number)}</span>; }
function Percent({ value, c }) { const number = Number(value) || 0; return <span style={{ color: number < 0 ? c.danger : number >= 100 ? c.success : c.warning, fontWeight: 800, whiteSpace: "nowrap" }}>{formatPercent(number)}</span>; }
function shortDate(value) { const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-PH", { month: "short", day: "numeric" }); }
function displayTitle(value) {
  const text = String(value || "").trim();
  if (!text) return "-";
  return text.split(/(\s+|-)/).map((part) => {
    if (!part || /^(\s+|-)$/.test(part)) return part;
    if (/^(IT|GPT|CM|ERP|VPN|UI|UX|HR|WPCC)$/i.test(part)) return part.toUpperCase();
    if (/^[A-Z0-9]+$/.test(part)) return part.length <= 2 ? part : `${part.charAt(0)}${part.slice(1).toLowerCase()}`;
    if (/^[a-z]+$/.test(part)) return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    return part;
  }).join("");
}
function displayName(value) { return displayTitle(value); }
function normalizeReportTitle(value) { const title = String(value || "").trim(); if (!title || /^it weekly report$/i.test(title)) return "IT Weekly Performance Report"; return displayTitle(title); }
function normalizeBranchLabel(value) { const branch = displayTitle(value); if (!value || !String(value).trim()) return "Corporate Office"; return /\bbranch\b/i.test(branch) ? branch : `${branch} Branch`; }
function formatCustomValue(value, type, calculated = true) { if (value == null || value === "") return calculated ? "-" : ""; if (type === "Currency") return formatCurrency(value); if (type === "Percentage") return formatPercent(value); if (type === "Number") return formatNumber(value); if (type === "Checkbox") return value ? "Yes" : "No"; return String(value); }
function effectiveReportPeriod(report) {
  const explicit = dateRangeText(report.info?.startDate, report.info?.endDate);
  if (explicit) return explicit;
  const rows = report.data?.rows || report.customConfig?.rows || [];
  const dates = rows.map((row) => row.date).filter(Boolean).sort();
  return dates.length ? dateRangeText(dates[0], dates[dates.length - 1]) : "";
}
