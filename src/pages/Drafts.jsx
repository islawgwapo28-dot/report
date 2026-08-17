import { useNavigate } from "react-router-dom";
import { useReports, deleteReport, duplicateReport } from "@/lib/reportStore";
import { Eye, Pencil, Copy, Trash2, FileEdit } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function Drafts() {
  const reports = useReports();
  const navigate = useNavigate();
  const drafts = reports.filter((r) => r.status === "Draft");

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <h1 className="text-xl font-bold text-slate-900">Saved Drafts</h1>
        <p className="text-sm text-slate-500 mt-0.5">Reports in progress — auto-saved as you work.</p>
      </header>
      <div className="p-6">
        {drafts.length === 0 ? (
          <div className="text-center py-20">
            <FileEdit size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No drafts yet. Drafts are saved automatically while building a report.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><FileEdit size={18} /></div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Draft</span>
                </div>
                <div className="text-sm font-semibold text-slate-800 truncate">{r.info.reportTitle || "Untitled"}</div>
                <div className="text-xs text-slate-500 mt-1">{r.department || "—"} · {r.info.reportType || "—"}</div>
                <div className="text-xs text-slate-400 mt-1">Last modified {r.updatedAt ? formatDate(r.updatedAt) : "—"}</div>
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100">
                  <Act icon={Eye} title="View" onClick={() => navigate(`/builder/${r.id}`)} />
                  <Act icon={Pencil} title="Edit" onClick={() => navigate(`/builder/${r.id}`)} />
                  <Act icon={Copy} title="Duplicate" onClick={() => { const c = duplicateReport(r.id); if (c) navigate(`/builder/${c.id}`); }} />
                  <Act icon={Trash2} title="Delete" danger onClick={() => { if (confirm("Delete this draft?")) deleteReport(r.id); }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Act({ icon: Icon, title, onClick, danger = false }) {
  return <button title={title} onClick={onClick} className={`p-1.5 rounded-md hover:bg-slate-200 ${danger ? "text-red-500 hover:bg-red-100" : "text-slate-500"}`}><Icon size={15} /></button>;
}
