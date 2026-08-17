// Report persistence with a local cache and optional Supabase synchronization.
// The local cache keeps the builder responsive/offline; Supabase becomes the shared
// database as soon as VITE_SUPABASE_URL + a publishable/anon key are configured.
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase, SUPABASE_REPORTS_TABLE } from "@/lib/supabase";

const KEY = "wpcc_reports_v1";
let remoteLoadPromise = null;
const pendingSync = new Map();

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sortReports(reports) {
  return [...reports].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
}

function writeAll(reports) {
  localStorage.setItem(KEY, JSON.stringify(reports));
  window.dispatchEvent(new CustomEvent("wpcc_reports_changed"));
}

function safeJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function toDbRow(report) {
  const payload = safeJson(report);
  return {
    id: report.id,
    payload,
    department: report.department || report.info?.department || null,
    status: report.status || "Draft",
    report_type: report.info?.reportType || null,
    branch: report.info?.branch || null,
    prepared_by: report.info?.preparedBy || null,
    created_at: report.createdAt || new Date().toISOString(),
    updated_at: report.updatedAt || new Date().toISOString(),
  };
}

function fromDbRow(row) {
  const payload = row?.payload && typeof row.payload === "object" ? row.payload : {};
  return {
    ...payload,
    id: row.id || payload.id,
    status: row.status || payload.status || "Draft",
    createdAt: row.created_at || payload.createdAt,
    updatedAt: row.updated_at || payload.updatedAt,
  };
}

function queueRemoteUpsert(report) {
  if (!isSupabaseConfigured || !supabase || !report?.id) return;
  const previous = pendingSync.get(report.id) || Promise.resolve();
  const task = previous
    .catch(() => {})
    .then(async () => {
      const { error } = await supabase.from(SUPABASE_REPORTS_TABLE).upsert(toDbRow(report), { onConflict: "id" });
      if (error) throw error;
    })
    .catch(() => {
      // Local storage remains the offline fallback; the next local save retries sync.
    })
    .finally(() => {
      if (pendingSync.get(report.id) === task) pendingSync.delete(report.id);
    });
  pendingSync.set(report.id, task);
}

function queueRemoteDelete(id) {
  if (!isSupabaseConfigured || !supabase || !id) return;
  const previous = pendingSync.get(id) || Promise.resolve();
  const task = previous
    .catch(() => {})
    .then(async () => {
      const { error } = await supabase.from(SUPABASE_REPORTS_TABLE).delete().eq("id", id);
      if (error) throw error;
    })
    .catch(() => {})
    .finally(() => {
      if (pendingSync.get(id) === task) pendingSync.delete(id);
    });
  pendingSync.set(id, task);
}

async function loadRemoteReports() {
  if (!isSupabaseConfigured || !supabase) return null;
  if (!remoteLoadPromise) {
    remoteLoadPromise = Promise.resolve(
      supabase.from(SUPABASE_REPORTS_TABLE).select("*").order("updated_at", { ascending: false }),
    )
      .then(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(fromDbRow);
      })
      .catch(() => null);
  }
  return remoteLoadPromise;
}

function mergeReports(localReports, remoteReports) {
  const byId = new Map();
  [...localReports, ...remoteReports].forEach((report) => {
    const current = byId.get(report.id);
    if (!current) {
      byId.set(report.id, report);
      return;
    }
    const currentTime = new Date(current.updatedAt || 0).getTime();
    const nextTime = new Date(report.updatedAt || 0).getTime();
    if (nextTime >= currentTime) byId.set(report.id, report);
  });
  return sortReports([...byId.values()]);
}

export function listReports() {
  return sortReports(readAll());
}

export function getReport(id) {
  return readAll().find((r) => r.id === id) || null;
}

export function saveReport(report) {
  const reports = readAll();
  const now = new Date().toISOString();
  const idx = reports.findIndex((r) => r.id === report.id);
  const updated = idx >= 0
    ? { ...reports[idx], ...report, updatedAt: now }
    : { ...report, createdAt: report.createdAt || now, updatedAt: now };
  if (idx >= 0) reports[idx] = updated;
  else reports.push(updated);
  writeAll(reports);
  queueRemoteUpsert(updated);
  return updated;
}

export function deleteReport(id) {
  writeAll(readAll().filter((r) => r.id !== id));
  queueRemoteDelete(id);
}

export function duplicateReport(id, overrides = {}) {
  const r = getReport(id);
  if (!r) return null;
  const copy = {
    ...safeJson(r),
    id: genId(),
    info: { ...r.info, reportTitle: `${r.info?.reportTitle || "Report"} (Copy)`, ...overrides.info },
    status: "Draft",
    createdAt: undefined,
    updatedAt: undefined,
  };
  return saveReport(copy);
}

export function genId() {
  return "rpt_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// React hook: render the local cache immediately, then merge shared Supabase data.
export function useReports() {
  const [reports, setReports] = useState(() => listReports());
  useEffect(() => {
    let active = true;
    const handler = () => setReports(listReports());
    window.addEventListener("wpcc_reports_changed", handler);
    window.addEventListener("storage", handler);

    loadRemoteReports().then((remoteReports) => {
      if (!active || !remoteReports) return;
      const localReports = readAll();
      const merged = mergeReports(localReports, remoteReports);
      writeAll(merged);
      if (active) setReports(merged);

      // Upload local-only/newer records so an existing local workspace is not lost.
      const remoteById = new Map(remoteReports.map((report) => [report.id, report]));
      localReports.forEach((local) => {
        const remote = remoteById.get(local.id);
        if (!remote || new Date(local.updatedAt || 0) > new Date(remote.updatedAt || 0)) queueRemoteUpsert(local);
      });
    });

    return () => {
      active = false;
      window.removeEventListener("wpcc_reports_changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return reports;
}

// Auto-save hook: debounced local save plus background Supabase upsert.
export function useAutoSave(report, enabled) {
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [savedReport, setSavedReport] = useState(report);

  useEffect(() => {
    if (!enabled || !report) return;
    setSaveState("saving");
    const t = setTimeout(() => {
      try {
        const saved = saveReport(report);
        setSavedReport(saved);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [JSON.stringify(report), enabled]);

  return { saveState, savedReport };
}

export function newReportSkeleton() {
  return {
    id: genId(),
    info: {
      companyName: "WELD POWERTOOLS & CONSTRUCTION CORPORATION",
      companyLogo: "",
      department: "",
      branch: "",
      preparedBy: "",
      reportTitle: "",
      startDate: "",
      endDate: "",
      reportType: "Weekly",
    },
    department: "",
    data: {},
    customConfig: { columns: [], rows: [] },
    design: {
      templateId: "darkblue",
      customColors: null,
      fontFamily: "Inter",
      showCharts: true,
      showExecutiveSummary: true,
      showGeneratedDate: true,
      showLogo: true,
    },
    sectionOrder: ["header", "kpi", "table", "charts", "summary", "executive"],
    status: "Draft",
  };
}
