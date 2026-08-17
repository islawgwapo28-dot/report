import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TEMPLATES } from "@/lib/templates";
import { Check } from "lucide-react";
import ReportPreview from "@/components/ReportPreview";
import { newReportSkeleton, saveReport } from "@/lib/reportStore";
import { IT_SAMPLE } from "@/lib/sampleData";

export default function Templates() {
  const navigate = useNavigate();
  const [previewId, setPreviewId] = useState(null);

  const demoReport = { ...IT_SAMPLE, id: "demo", design: { templateId: previewId || "darkblue", customColors: null } };
  const useTemplate = () => {
    if (!previewId) return;
    const saved = saveReport({ ...newReportSkeleton(), design: { templateId: previewId, customColors: null } });
    navigate(`/builder/${saved.id}?start=1`);
  };

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <h1 className="text-xl font-bold text-slate-900">Templates</h1>
        <p className="text-sm text-slate-500 mt-0.5">Choose a professional report design. Switching templates never affects your data.</p>
      </header>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {TEMPLATES.map((t, index) => {
            const c = t.colors;
            const active = previewId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPreviewId(t.id)}
                className={`text-left rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg ${active ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className="h-28 p-3 flex flex-col justify-between" style={{ background: c.bg }}>
                  <div className="h-7 rounded flex items-center px-2" style={{ background: c.headerBg }}>
                    <div className="h-3 w-3 rounded-full" style={{ background: c.accent }} />
                    <div className="ml-2 h-2 w-20 rounded" style={{ background: c.headerText, opacity: 0.6 }} />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="h-8 rounded" style={{ background: c.cardBg, border: `1px solid ${c.border}` }} />
                    <div className="h-8 rounded" style={{ background: c.cardBg, border: `1px solid ${c.border}` }} />
                    <div className="h-8 rounded" style={{ background: c.accent }} />
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <div className="text-sm font-semibold text-slate-800 flex items-center justify-between">
                    <span><span className="text-slate-400 mr-1">{String(index + 1).padStart(2, "0")}</span>{t.name}</span>
                    {active && <Check size={15} className="text-blue-600" />}
                  </div>
                  <div className="text-xs text-slate-500">{t.idealFor}</div>
                </div>
              </button>
            );
          })}
        </div>

        {previewId && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Live Preview</h3>
              <button onClick={useTemplate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Use this template</button>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg" style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <ReportPreview report={demoReport} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
