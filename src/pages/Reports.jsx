import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReports, deleteReport, duplicateReport, saveReport } from "@/lib/reportStore";
import { Eye, Pencil, Copy, Trash2, Search, FilePenLine, Download } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function Reports() {
  const reports = useReports();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ department: "", date: "", type: "", branch: "", preparedBy: "" });

  const filtered = reports.filter((r) => {
    if (search && !`${r.info.reportTitle} ${r.department} ${r.info.preparedBy}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.department && r.department !== filters.department) return false;
    if (filters.date) {
      const start = r.info.startDate || r.info.endDate;
      const end = r.info.endDate || r.info.startDate;
      if (!start || filters.date < start || filters.date > end) return false;
    }
    if (filters.type && r.info.reportType !== filters.type) return false;
    if (filters.branch && r.info.branch !== filters.branch) return false;
    if (filters.preparedBy && r.info.preparedBy !== filters.preparedBy) return false;
    return true;
  });

  const departments = [...new Set(reports.map((r) => r.department).filter(Boolean))];
  const types = [...new Set(reports.map((r) => r.info.reportType).filter(Boolean))];
  const branches = [...new Set(reports.map((r) => r.info.branch).filter(Boolean))];
  const preparers = [...new Set(reports.map((r) => r.info.preparedBy).filter(Boolean))];

  const onDelete = (r) => {
    if (confirm(`Delete "${r.info.reportTitle}"?`)) deleteReport(r.id);
  };
  const onRename = (report) => {
    const title = window.prompt("Rename report", report.info.reportTitle || "Untitled Report")?.trim();
    if (title && title !== report.info.reportTitle) {
      saveReport({ ...report, info: { ...report.info, reportTitle: title } });
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <h1 className="text-xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">All saved and draft reports</p>
      </header>
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <FilterSelect label="Department" value={filters.department} options={departments} onChange={(v) => setFilters({ ...filters, department: v })} />
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Date
            <input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <FilterSelect label="Report Type" value={filters.type} options={types} onChange={(v) => setFilters({ ...filters, type: v })} />
          <FilterSelect label="Branch" value={filters.branch} options={branches} onChange={(v) => setFilters({ ...filters, branch: v })} />
          <FilterSelect label="Prepared By" value={filters.preparedBy} options={preparers} onChange={(v) => setFilters({ ...filters, preparedBy: v })} />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">No reports match your filters.</div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Report Title</th>
                  <th className="text-left px-5 py-3 font-medium">Department</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-left px-5 py-3 font-medium">Branch</th>
                  <th className="text-left px-5 py-3 font-medium">Prepared By</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Last Modified</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60 group">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-800">{r.info.reportTitle || "Untitled"}</div>
                      <div className="text-xs text-slate-400">{r.info.startDate ? `${formatDate(r.info.startDate)} – ${formatDate(r.info.endDate)}` : ""}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{r.department || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{r.info.reportType || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{r.info.branch || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{r.info.preparedBy || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${r.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>{r.status || "Draft"}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{r.updatedAt ? formatDate(r.updatedAt) : "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Act icon={Eye} title="View" onClick={() => navigate(`/builder/${r.id}?preview=1`)} />
                        <Act icon={Pencil} title="Edit" onClick={() => navigate(`/builder/${r.id}`)} />
                        <Act icon={Copy} title="Duplicate" onClick={() => { const c = duplicateReport(r.id); if (c) navigate(`/builder/${c.id}`); }} />
                        <Act icon={FilePenLine} title="Rename" onClick={() => onRename(r)} />
                        <Act icon={Download} title="Export" onClick={() => navigate(`/builder/${r.id}?preview=1`)} />
                        <Act icon={Trash2} title="Delete" danger onClick={() => onDelete(r)} />
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
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100">
      <option value="">All {label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Act({ icon: Icon, title, onClick, danger = false }) {
  return <button title={title} onClick={onClick} className={`p-1.5 rounded-md hover:bg-slate-200 ${danger ? "text-red-500 hover:bg-red-100" : "text-slate-500"}`}><Icon size={15} /></button>;
}
