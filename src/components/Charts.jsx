import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, BarChart as HBar,
} from "recharts";
import { formatCompactCurrency, formatNumber } from "@/lib/format";

const STATUS_COLOR = {
  Completed: "#22c55e",
  "In Progress": "#3b82f6",
  Pending: "#f59e0b",
  "On Hold": "#eab308",
  Cancelled: "#ef4444",
};
const PRIORITY_COLOR = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#64748b",
};

function TooltipBox({ active = false, payload = [], label = "", currency = false }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg shadow-lg px-3 py-2 text-xs" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
      {label && <div className="font-semibold mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#333" }}>
          {p.name}: {currency ? formatCompactCurrency(p.value) : (p.value % 1 === 0 ? formatNumber(p.value) : p.value.toFixed(2))}
        </div>
      ))}
    </div>
  );
}

export function ActivityCharts({ calc, colors }) {
  const palette = colors.chartColors;
  const statusData = [
    { name: "Completed", value: calc.completed, color: STATUS_COLOR.Completed },
    { name: "In Progress", value: calc.inProgress, color: STATUS_COLOR["In Progress"] },
    { name: "Pending", value: calc.pending, color: STATUS_COLOR.Pending },
    { name: "On Hold", value: calc.onHold, color: STATUS_COLOR["On Hold"] },
    { name: "Cancelled", value: calc.cancelled, color: STATUS_COLOR.Cancelled },
  ].filter((d) => d.value > 0);

  const priorityData = [
    { name: "Critical", value: calc.priority.Critical, color: PRIORITY_COLOR.Critical },
    { name: "High", value: calc.priority.High, color: PRIORITY_COLOR.High },
    { name: "Medium", value: calc.priority.Medium, color: PRIORITY_COLOR.Medium },
    { name: "Low", value: calc.priority.Low, color: PRIORITY_COLOR.Low },
  ];

  const empData = calc.employeeContribution.map((e, i) => ({
    name: e.name, count: e.count, color: palette[i % palette.length],
  }));
  const dateData = calc.perDate.map((d) => ({ date: d.date, count: d.count }));
  const trendData = calc.completionTrend || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Task Status Distribution</h4>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<TooltipBox />} />
            <Legend wrapperStyle={{ fontSize: 11, color: colors.textMuted }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Completion Trend</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.textMuted }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: colors.textMuted }} unit="%" />
            <Tooltip content={<TooltipBox />} />
            <Line type="monotone" dataKey="rate" name="Completion %" stroke={colors.success} strokeWidth={2.5} dot={{ r: 4, fill: colors.success }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Employee Contribution</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={empData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: colors.textMuted }} />
            <YAxis tick={{ fontSize: 11, fill: colors.textMuted }} allowDecimals={false} />
            <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="count" name="Activities" radius={[4, 4, 0, 0]}>
              {empData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Activities by Date</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dateData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.textMuted }} />
            <YAxis tick={{ fontSize: 11, fill: colors.textMuted }} allowDecimals={false} />
            <Tooltip content={<TooltipBox />} />
            <Line type="monotone" dataKey="count" name="Activities" stroke={colors.accent} strokeWidth={2.5} dot={{ r: 4, fill: colors.accent }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Priority Distribution</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: colors.textMuted }} />
            <YAxis tick={{ fontSize: 11, fill: colors.textMuted }} allowDecimals={false} />
            <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
              {priorityData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SalesCharts({ calc, colors }) {
  const palette = colors.chartColors;
  const rows = calc.rows;
  const netData = rows.map((r, i) => ({ name: r.salesperson, Net: r.netSales, Quota: r.quota, color: palette[i % palette.length] }));
  const contribution = rows.map((r, i) => ({ name: r.salesperson, value: Math.abs(r.netSales), color: palette[i % palette.length] })).filter((d) => d.value > 0);
  const achData = rows.map((r, i) => ({ name: r.salesperson, Achievement: r.achievement, color: r.achievement >= 100 ? colors.success : colors.danger }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Sales Amount Comparison (Net Sales)</h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={netData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textMuted }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} tickFormatter={(v) => formatCompactCurrency(v)} />
            <Tooltip content={<TooltipBox currency />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="Net" name="Net Sales" radius={[4, 4, 0, 0]}>
              {netData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Net Sales Contribution</h4>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={contribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={(e) => e.name} labelLine={false}>
              {contribution.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<TooltipBox currency />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Achievement Comparison (%)</h4>
        <ResponsiveContainer width="100%" height={240}>
          <HBar layout="vertical" data={achData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: colors.textMuted }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: colors.textMuted }} width={90} />
            <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="Achievement" name="Achievement %" radius={[0, 4, 4, 0]}>
              {achData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </HBar>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Quota vs Actual</h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={netData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textMuted }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} tickFormatter={(v) => formatCompactCurrency(v)} />
            <Tooltip content={<TooltipBox currency />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Quota" fill={colors.accent2} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Net" name="Net Sales" fill={colors.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MarketingCharts({ calc, colors }) {
  const palette = colors.chartColors;
  const platformData = calc.byPlatform.map((d, i) => ({ ...d, color: palette[i % palette.length] }));
  const campaignData = calc.byCampaign.map((d, i) => ({ ...d, color: palette[(i + 2) % palette.length] }));
  const dateData = calc.byDate.map((d) => ({ date: d.date, count: d.count, orders: d.orders, sales: d.sales }));
  const inquiryData = calc.byPlatform.map((d, i) => ({ name: d.name, inquiries: calc.rowsByPlatform?.[d.name]?.inquiries || 0, color: palette[i % palette.length] }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Platform Usage</h4>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={platformData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name} labelLine={false}>
              {platformData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<TooltipBox />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Campaign Distribution</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={campaignData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: colors.textMuted }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: colors.textMuted }} width={120} />
            <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="count" name="Activities" radius={[0, 4, 4, 0]}>
              {campaignData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Customer Inquiries by Platform</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={inquiryData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: colors.textMuted }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} allowDecimals={false} />
            <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="inquiries" name="Inquiries" radius={[4, 4, 0, 0]}>
              {inquiryData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Daily Activities</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dateData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.textMuted }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} allowDecimals={false} />
            <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="count" name="Activities" fill={colors.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Orders by Date</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dateData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.textMuted }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} allowDecimals={false} />
            <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="orders" name="Orders" fill={colors.accent2} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Sales Performance Trend</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dateData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.textMuted }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} tickFormatter={(v) => formatCompactCurrency(v)} />
            <Tooltip content={<TooltipBox currency />} />
            <Line type="monotone" dataKey="sales" name="Sales" stroke={colors.accent} strokeWidth={2.5} dot={{ r: 4, fill: colors.accent }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
