import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Save, Copy, Printer, Image, FileDown, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { useAutoSave, getReport, saveReport, newReportSkeleton, duplicateReport } from "@/lib/reportStore";
import { DEPARTMENTS, getDepartmentConfig } from "@/lib/departments";
import { resolveTheme } from "@/lib/templates";
import { calcActivity, calcSales, calcMarketing, buildExecutiveSummary } from "@/lib/calc";
import DataEntry from "@/components/DataEntry";
import CustomReportBuilder from "@/components/CustomReportBuilder";
import DesignSelector from "@/components/DesignSelector";
import ReportPreview from "@/components/ReportPreview";
import { ActivityCharts, SalesCharts, MarketingCharts } from "@/components/Charts";

const STEPS = [
  { n: 1, label: "Report Info" },
  { n: 2, label: "Department" },
  { n: 3, label: "Data" },
  { n: 4, label: "Analytics" },
  { n: 5, label: "Design" },
  { n: 6, label: "Preview" },
];

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState(() => {
    const skeleton = newReportSkeleton();
    const stored = id ? getReport(id) : null;
    return stored ? {
      ...skeleton,
      ...stored,
      info: { ...skeleton.info, ...stored.info },
      design: { ...skeleton.design, ...stored.design },
      sectionOrder: stored.sectionOrder || skeleton.sectionOrder,
    } : skeleton;
  });
  const [step, setStep] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("preview") === "1" ? 6 : params.get("start") === "1" ? 1 : id ? 3 : 1;
  });
  const [toast, setToast] = useState(null);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [previewReviewed, setPreviewReviewed] = useState(false);
  const previewRef = useRef(null);
  const previewShellRef = useRef(null);
  const { saveState } = useAutoSave(report, true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const deptConfig = getDepartmentConfig(report.department);
  const reportType = deptConfig?.reportType || "activity";

  // ensure data structure exists when department chosen
  useEffect(() => {
    if (report.department && !report.data) {
      setReport({ ...report, data: { rows: [] } });
    }
  }, [report.department]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsPreviewFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (step !== 6) {
      setIsPreviewFullscreen(false);
      setPreviewReviewed(false);
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  }, [step]);

  const goNext = () => setStep((s) => Math.min(6, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const selectDepartment = (deptId) => {
    setReport({ ...report, department: deptId, info: { ...report.info, department: deptId } });
    setStep(3);
  };

  const finalizeSave = (status = "Completed") => {
    const saved = saveReport({ ...report, status });
    showToast(status === "Draft" ? "Draft saved" : "Report saved");
    navigate("/reports");
  };

  const saveFromPreview = (status = "Completed") => {
    if (step === 6 && !previewReviewed) {
      showToast("Open Full Screen Preview first to review the aligned report.", "error");
      return;
    }
    finalizeSave(status);
  };

  const openPreviewFullscreen = async () => {
    setPreviewReviewed(true);
    setIsPreviewFullscreen(true);
    try {
      await previewShellRef.current?.requestFullscreen?.();
    } catch {
      // The in-app full-screen overlay remains available when browser fullscreen is blocked.
    }
  };

  const closePreviewFullscreen = async () => {
    setIsPreviewFullscreen(false);
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { /* already exited */ }
    }
  };

  const requirePreviewReview = (action) => {
    if (step === 6 && !previewReviewed) {
      showToast(`Open Full Screen Preview before ${action}.`, "error");
      return false;
    }
    return true;
  };

  const duplicate = () => {
    saveReport(report);
    const copy = duplicateReport(report.id);
    if (copy) { showToast("Report duplicated"); navigate(`/builder/${copy.id}`); }
  };

  // ---- Export ----
  const captureImage = async (targetWidth = 3344) => {
    if (!previewRef.current) return;
    await document.fonts?.ready;
    const images = Array.from(previewRef.current.querySelectorAll("img"));
    await Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    })));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const html2canvas = (await import("html2canvas")).default;
    const sourceWidth = previewRef.current.scrollWidth || 1672;
    const sourceHeight = previewRef.current.scrollHeight || 941;
    const scale = Math.max(1, targetWidth / sourceWidth);
    const canvas = await html2canvas(previewRef.current, {
      scale,
      width: sourceWidth,
      height: sourceHeight,
      windowWidth: sourceWidth,
      windowHeight: sourceHeight,
      backgroundColor: resolveTheme(report.design.templateId, report.design.customColors).colors.bg,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
    });
    return canvas;
  };
  const exportImage = async (fmt, resolution = "standard") => {
    try {
      const is4K = resolution === "4k";
      const canvas = await captureImage(is4K ? 3840 : 3344);
      const mime = fmt === "jpg" ? "image/jpeg" : "image/png";
      const url = canvas.toDataURL(mime, 0.95);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeFileName(report.info.reportTitle || "report")}${is4K ? "-4k" : ""}.${fmt}`;
      a.click();
      showToast(`Exported ${fmt.toUpperCase()}${is4K ? " 4K" : ""}`);
    } catch (e) { showToast("Export failed", "error"); }
  };
  const exportPDF = async () => {
    try {
      const canvas = await captureImage(3344);
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const margin = 2;
      const scale = Math.min((pw - margin * 2) / canvas.width, (ph - margin * 2) / canvas.height);
      const imgW = canvas.width * scale;
      const imgH = canvas.height * scale;
      const x = (pw - imgW) / 2;
      const y = (ph - imgH) / 2;
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", x, y, imgW, imgH, undefined, "FAST");
      pdf.save(`${safeFileName(report.info.reportTitle || "report")}.pdf`);
      showToast("Exported one-page landscape PDF");
    } catch (e) { showToast("Export failed", "error"); }
  };
  const printReport = () => {
    const pageStyle = document.createElement("style");
    pageStyle.id = "wpcc-print-page-style";
    pageStyle.textContent = "@page { size: A4 landscape; margin: 0; }";
    document.head.appendChild(pageStyle);
    document.body.classList.add("printing-report");
    window.onafterprint = () => {
      document.body.classList.remove("printing-report");
      pageStyle.remove();
      window.onafterprint = null;
    };
    window.print();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="h-14 shrink-0 border-b border-slate-200 bg-white px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-slate-400 hover:text-slate-700 text-sm">← Dashboard</button>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-700 truncate max-w-xs">
            {report.info.reportTitle || "New Report"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            {saveState === "saving" ? <><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Saving...</> : saveState === "saved" ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> All changes saved</> : saveState === "error" ? <><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Could not save locally</> : null}
          </span>
          <button onClick={duplicate} className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1.5"><Copy size={14} /> Duplicate</button>
          <button onClick={() => saveFromPreview("Draft")} className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1.5"><Save size={14} /> Save Draft</button>
          <button onClick={() => saveFromPreview("Completed")} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-1.5"><Check size={14} /> Save Report</button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="h-14 shrink-0 border-b border-slate-200 bg-white px-5 flex items-center gap-1 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                step === s.n ? "bg-slate-900 text-white" : step > s.n ? "text-slate-600 hover:bg-slate-100" : "text-slate-400 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === s.n ? "bg-white text-slate-900" : step > s.n ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
              }`}>{step > s.n ? <Check size={11} /> : s.n}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="text-slate-300">→</span>}
          </div>
        ))}
      </div>

      {/* Step body */}
      <div className="flex-1 min-h-0 overflow-hidden bg-slate-50 p-5">
        <div className="h-full bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          {step === 1 && <StepInfo report={report} setReport={setReport} />}
          {step === 2 && <StepDept report={report} onSelect={selectDepartment} />}
          {step === 3 && (
            report.department === "Custom Report"
              ? <div className="flex-1 min-h-0 p-5"><CustomReportBuilder report={report} setReport={setReport} /></div>
              : <div className="flex-1 min-h-0 p-5"><DataEntry report={report} setReport={setReport} onImportToast={showToast} /></div>
          )}
          {step === 4 && <StepAnalytics report={report} setStep={setStep} />}
          {step === 5 && (
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_390px] overflow-hidden">
              <div className="hidden xl:block overflow-auto bg-slate-200 p-5">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">Live report preview</div>
                <div className="mx-auto rounded-xl overflow-auto shadow-xl" style={{ maxWidth: 1672 }}>
                  <ReportPreview report={report} />
                </div>
              </div>
              <div className="p-5 overflow-auto border-l border-slate-200 bg-white">
                <DesignSelector
                  design={report.design}
                  onChange={(design) => setReport({ ...report, design })}
                />
              </div>
            </div>
          )}
          {step === 6 && (
            <StepPreview
              report={report}
              previewRef={previewRef}
              previewShellRef={previewShellRef}
              isFullscreen={isPreviewFullscreen}
              previewReviewed={previewReviewed}
              enterFullscreen={openPreviewFullscreen}
              exitFullscreen={closePreviewFullscreen}
              exportImage={(format, resolution = "standard") => requirePreviewReview(`exporting ${format.toUpperCase()}${resolution === "4k" ? " 4K" : ""}`) && exportImage(format, resolution)}
              exportPDF={() => requirePreviewReview("exporting PDF") && exportPDF()}
              printReport={() => requirePreviewReview("printing") && printReport()}
              saveReport={saveFromPreview}
            />
          )}
        </div>
      </div>

      {/* Nav */}
      {step !== 6 && (
        <div className="h-14 shrink-0 border-t border-slate-200 bg-white px-5 flex items-center justify-between">
          <button onClick={goBack} disabled={step === 1} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-100">
            <ChevronLeft size={16} /> Back
          </button>
          <button onClick={goNext} disabled={(step === 2 && !report.department) || (step === 1 && report.info.startDate && report.info.endDate && report.info.endDate < report.info.startDate)} className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40">
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm ${toast.type === "error" ? "bg-red-600" : "bg-slate-900"} text-white`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ---- Step 1: Report Info ----
function StepInfo({ report, setReport }) {
  const info = report.info;
  const set = (patch) => setReport({ ...report, info: { ...info, ...patch } });
  const logoRef = useRef(null);
  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ companyLogo: reader.result });
    reader.readAsDataURL(file);
  };
  return (
    <div className="flex-1 min-h-0 overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Company Name"><input value={info.companyName} onChange={(e) => set({ companyName: e.target.value })} className="input" /></Field>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Company Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                {info.companyLogo ? <img src={info.companyLogo} alt="logo" className="w-full h-full object-contain" /> : <span className="text-slate-300 text-xl">W</span>}
              </div>
              <button onClick={() => logoRef.current?.click()} className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">Upload Logo</button>
              {info.companyLogo && <button onClick={() => set({ companyLogo: "" })} className="text-sm text-red-500 hover:underline">Remove</button>}
              <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </div>
          </div>
          <Field label="Department / Team"><input value={info.department} onChange={(e) => set({ department: e.target.value })} className="input" placeholder="e.g. Information Technology" /></Field>
          <Field label="Branch"><input value={info.branch} onChange={(e) => set({ branch: e.target.value })} className="input" /></Field>
          <Field label="Prepared By"><input value={info.preparedBy} onChange={(e) => set({ preparedBy: e.target.value })} className="input" /></Field>
          <Field label="Report Title"><input value={info.reportTitle} onChange={(e) => set({ reportTitle: e.target.value })} className="input" placeholder="e.g. IT Weekly Performance Report" /></Field>
          <Field label="Start Date"><input type="date" value={info.startDate} onChange={(e) => set({ startDate: e.target.value })} className="input" /></Field>
          <Field label="End Date"><input type="date" value={info.endDate} onChange={(e) => set({ endDate: e.target.value })} className="input" /></Field>
          <Field label="Report Type">
            <select value={info.reportType} onChange={(e) => set({ reportType: e.target.value })} className="input">
              {["Daily", "Weekly", "Monthly", "Quarterly", "Annual", "Custom Date Range"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          {info.startDate && info.endDate && info.endDate < info.startDate && (
            <p className="md:col-span-2 text-xs text-red-600">End date must be on or after the start date.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ---- Step 2: Department ----
function StepDept({ report, onSelect }) {
  return (
    <div className="flex-1 min-h-0 overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5 text-center max-w-lg mx-auto">Select the department for this report. Each department has its own relevant data fields and automatic calculations.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
        {DEPARTMENTS.map((d) => {
          const Icon = d.icon;
          const active = report.department === d.id;
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-md ${active ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}
              style={{ background: active ? "#eff6ff" : "#fff" }}
            >
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3" style={{ background: d.color + "15", color: d.color }}>
                <Icon size={22} />
              </div>
              <div className="text-sm font-semibold text-slate-800">{d.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{d.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Step 4: Analytics ----
function StepAnalytics({ report, setStep }) {
  const dept = report.department;
  const calc =
    dept === "Sales" ? calcSales(report.data?.rows || []) :
    dept === "Marketing / Online Sales" ? calcMarketing(report.data?.rows || []) :
    dept === "Custom Report" ? null :
    calcActivity(report.data?.rows || []);
  const theme = resolveTheme(report.design.templateId, report.design.customColors);
  const c = theme.colors;

  if (!report.department) {
    return <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select a department first.</div>;
  }
  if (dept === "Custom Report") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Sparkles size={32} className="text-slate-300" />
        <p className="text-sm">Custom reports use your defined columns and computed summaries in the preview step.</p>
        <button onClick={() => setStep(6)} className="text-sm px-4 py-2 bg-slate-900 text-white rounded-lg">Go to Preview</button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto p-6">
      <div className="rounded-xl p-5 mb-4" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: c.text }}>Live Executive Summary Preview</h3>
        <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{buildExecutiveSummary(report, calc)}</p>
      </div>
      {dept === "Sales" && <SalesCharts calc={calc} colors={c} />}
      {dept === "Marketing / Online Sales" && <MarketingCharts calc={calc} colors={c} />}
      {dept !== "Sales" && dept !== "Marketing / Online Sales" && <ActivityCharts calc={calc} colors={c} />}
    </div>
  );
}

// ---- Step 6: Preview & Export ----
function StepPreview({ report, previewRef, previewShellRef, isFullscreen, previewReviewed, enterFullscreen, exitFullscreen, exportImage, exportPDF, printReport, saveReport }) {
  const actionClass = "text-sm px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <div ref={previewShellRef} className={isFullscreen ? "wpcc-preview-fullscreen fixed inset-0 z-[100] flex flex-col" : "flex-1 min-h-0 flex flex-col"}>
      <div className="shrink-0 border-b border-slate-200 px-5 py-3 flex items-center gap-2 bg-white flex-wrap">
        <span className="text-xs text-slate-400 mr-2">Preview & Export</span>
        {!previewReviewed && <span className="text-xs text-amber-600 mr-auto">Open Full Screen Preview to review alignment before export or save.</span>}
        <button onClick={isFullscreen ? exitFullscreen : enterFullscreen} className="text-sm px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 inline-flex items-center gap-1.5">
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {isFullscreen ? "Exit Full Screen" : "Full Screen Preview"}
        </button>
        <button onClick={exportPDF} disabled={!previewReviewed} title={!previewReviewed ? "Review the report in full screen first" : "Export PDF"} className={actionClass}><FileDown size={14} /> PDF</button>
        <button onClick={() => exportImage("png")} disabled={!previewReviewed} title={!previewReviewed ? "Review the report in full screen first" : "Export PNG"} className={actionClass}><Image size={14} /> PNG</button>
        <button onClick={() => exportImage("jpg")} disabled={!previewReviewed} title={!previewReviewed ? "Review the report in full screen first" : "Export JPG"} className={actionClass}><Image size={14} /> JPG</button>
        <button onClick={() => exportImage("png", "4k")} disabled={!previewReviewed} title={!previewReviewed ? "Review the report in full screen first" : "Export 4K PNG"} className={actionClass}><Image size={14} /> PNG 4K</button>
        <button onClick={() => exportImage("jpg", "4k")} disabled={!previewReviewed} title={!previewReviewed ? "Review the report in full screen first" : "Export 4K JPG"} className={actionClass}><Image size={14} /> JPG 4K</button>
        <button onClick={printReport} disabled={!previewReviewed} title={!previewReviewed ? "Review the report in full screen first" : "Print report"} className={actionClass}><Printer size={14} /> Print</button>
        <button onClick={() => saveReport("Completed")} disabled={!previewReviewed} title={!previewReviewed ? "Review the report in full screen first" : "Save report"} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"><Check size={14} /> Save Report</button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto bg-slate-200">
        <div className="min-h-full min-w-max flex items-start justify-center p-6">
          <div id="report-print-area" className="shadow-xl rounded-xl shrink-0" style={{ width: "1672px", maxWidth: "none" }}>
            <ReportPreview report={report} forwardRef={previewRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function safeFileName(value) {
  return value.trim().replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "-").slice(0, 100) || "report";
}
