import { Link, useNavigate } from "react-router-dom";
import { useReports, deleteReport, saveReport, duplicateReport, genId } from "@/lib/reportStore";
import { SAMPLES } from "@/lib/sampleData";
import { Plus, FileText, Palette, FileStack, Eye, Pencil, Copy, Download, Trash2, TrendingUp, CheckCircle2, FileEdit, Calendar, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function Dashboard() {
  const reports = useReports();
  const navigate = useNavigate();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);

  const total = reports.length;
  const thisWeek = reports.filter((r) => new Date(r.createdAt) >= weekAgo).length;
  const thisMonth = reports.filter((r) => new Date(r.createdAt) >= monthAgo).length;
  const completed = reports.filter((r) => r.status === "Completed").length;
  const drafts = reports.filter((r) => r.status === "Draft").length;

  const recent = reports.slice(0, 8);

  const stats = [
    { label: "Total Reports", value: total, icon: FileText, color: "bg-blue-50 text-blue-600" },
    { label: "Reports This Week", value: thisWeek, icon: Calendar, color: "bg-emerald-50 text-emerald-600" },
    { label: "Reports This Month", value: thisMonth, icon: TrendingUp, color: "bg-violet-50 text-violet-600" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
    { label: "Draft Reports", value: drafts, icon: FileEdit, color: "bg-amber-50 text-amber-600" },
  ];

  const onDelete = (id, title) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteReport(id);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">WPCC SMART REPORT BUILDER</h1>
            <p className="text-sm text-slate-500 mt-1">Performance Reporting & Analytics System</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/builder")} className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">
              <Plus size={16} /> Create New Report
            </button>
            <Link to="/reports" className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
              <FileText size={16} /> Reports
            </Link>
            <Link to="/templates" className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
              <Palette size={16} /> Templates
            </Link>
            <Link to="/drafts" className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
              <FileStack size={16} /> Saved Drafts
            </Link>
            {reports.length === 0 && (
              <button onClick={() => { Object.values(SAMPLES).forEach((sample) => saveReport({ ...sample, id: genId(), design: { templateId: sample.department === "Sales" ? "executive-red" : sample.department === "Marketing / Online Sales" ? "corporate-green" : "darkblue", customColors: null }, sectionOrder: ["header", "kpi", "table", "charts", "summary", "executive"], status: "Completed" })); }} className="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-lg text-sm hover:bg-emerald-100">
                <Sparkles size={16} /> Load Sample Data
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                  <Icon size={20} />
                </div>
                <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Recent reports */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Recent Reports</h2>
            <Link to="/reports" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No reports yet.</p>
              <button onClick={() => navigate("/builder")} className="mt-3 text-sm px-4 py-2 bg-red-600 text-white rounded-lg inline-flex items-center gap-1.5">
                <Plus size={14} /> Create your first report
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Report Period</th>
                    <th className="text-left px-5 py-3 font-medium">Department</th>
                    <th className="text-left px-5 py-3 font-medium">Report Type</th>
                    <th className="text-left px-5 py-3 font-medium">Prepared By</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium">Last Modified</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60 group">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800">{r.info.reportTitle || "Untitled"}</div>
                        <div className="text-xs text-slate-400">
                          {r.info.startDate || r.info.endDate ? `${formatDate(r.info.startDate)} – ${formatDate(r.info.endDate)}` : "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{r.department || r.info.department || "—"}</td>
                      <td className="px-5 py-3 text-slate-600">{r.info.reportType || "—"}</td>
                      <td className="px-5 py-3 text-slate-600">{r.info.preparedBy || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${r.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                          {r.status || "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">{r.updatedAt ? formatDate(r.updatedAt) : "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <ActionBtn icon={Eye} title="View" onClick={() => navigate(`/builder/${r.id}?preview=1`)} />
                          <ActionBtn icon={Pencil} title="Edit" onClick={() => navigate(`/builder/${r.id}`)} />
                          <ActionBtn icon={Copy} title="Duplicate" onClick={() => { const c = duplicateReport(r.id); if (c) navigate(`/builder/${c.id}`); }} />
                          <ActionBtn icon={Download} title="Export" onClick={() => navigate(`/builder/${r.id}?preview=1`)} />
                          <ActionBtn icon={Trash2} title="Delete" danger onClick={() => onDelete(r.id, r.info.reportTitle)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, title, onClick, danger = false }) {
  return (
    <button title={title} onClick={onClick} className={`p-1.5 rounded-md hover:bg-slate-200 ${danger ? "text-red-500 hover:bg-red-100" : "text-slate-500"}`}>
      <Icon size={15} />
    </button>
  );
}
