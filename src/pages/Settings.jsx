import { useReports, deleteReport } from "@/lib/reportStore";
import { isSupabaseConfigured, supabaseProjectUrl } from "@/lib/supabase";
import { Trash2, Database, Download, AlertTriangle } from "lucide-react";

export default function Settings() {
  const reports = useReports();

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wpcc_reports_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (confirm("Delete ALL reports? This cannot be undone.")) {
      reports.forEach((r) => deleteReport(r.id));
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your report data and storage.</p>
      </header>
      <div className="p-6 max-w-2xl space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-1">
            <Database size={18} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Storage</h3>
          </div>
          <p className="text-sm text-slate-500">
            {isSupabaseConfigured
              ? <>Supabase sync is configured for shared report storage. Run the WPCC migration once in the Supabase SQL Editor if this is a new project. Local browser cache keeps the builder fast and available offline. <span className="block text-xs text-slate-400 mt-1">{supabaseProjectUrl}</span></>
              : <>Reports are stored locally in your browser (localStorage). Configure Supabase environment variables to enable shared storage.</>}
            <span className="block mt-1">{reports.length} report(s) currently saved.</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Backup</h3>
          <p className="text-sm text-slate-500 mb-3">Download a JSON backup of all your reports.</p>
          <button onClick={exportAll} className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
            <Download size={15} /> Export All Reports
          </button>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="text-sm font-semibold text-slate-800">Danger Zone</h3>
          </div>
          <p className="text-sm text-slate-500 mb-3">Permanently delete all saved reports and drafts.</p>
          <button onClick={clearAll} className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
            <Trash2 size={15} /> Delete All Reports
          </button>
        </div>
      </div>
    </div>
  );
}
