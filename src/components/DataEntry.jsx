import { useRef, useState } from "react";
import { Upload, Download, X } from "lucide-react";
import DataTable from "./DataTable";
import {
  getActivityFields, SALES_FIELDS, MARKETING_FIELDS,
  emptyActivityRow, emptySalesRow, emptyMarketingRow,
} from "@/lib/departments";
import { parseNumber } from "@/lib/format";

const HEADER_ALIASES = {
  salesperson: ["name", "sales person", "salesperson", "employee"],
  quota: ["quota", "target", "individual target", "individual quota"],
  grossSales: ["gross", "gross sales", "sales"],
  creditMemo: ["cm", "credit memo", "credit memo cm"],
  returns: ["returns", "adjustments", "returns adjustments"],
  employee: ["name", "employee", "employee name", "staff"],
  activity: ["activity", "task", "main activity"],
  campaignType: ["campaign", "campaign type"],
  inquiries: ["inquiry", "inquiries", "customer inquiries"],
  salesAmount: ["sales", "sales amount", "amount"],
};

function normalizeHeader(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Excel/CSV import: parse file, map columns, push rows.
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  // simple CSV parse (handles quoted fields)
  const parseLine = (line) => {
    const out = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { out.push(cur); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur);
    return out;
  };
  const headers = parseLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i]; });
    return obj;
  });
}

export default function DataEntry({ report, setReport, onImportToast }) {
  const dept = report.department;
  const rows = report.data?.rows || [];
  const fileRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);

  const setRows = (next) => {
    setReport({ ...report, data: { ...report.data, rows: next } });
  };

  const addFirstRow = () => {
    if (rows.length === 0) {
      const sample = dept === "Sales" ? emptySalesRow() : dept === "Marketing / Online Sales" ? emptyMarketingRow() : emptyActivityRow();
      setRows([sample]);
    }
  };

  const fields =
    dept === "Sales" ? SALES_FIELDS
    : dept === "Marketing / Online Sales" ? MARKETING_FIELDS
    : getActivityFields(dept);

  // computed extra columns (for sales: net + achievement)
  let computedExtra = null;
  if (dept === "Sales") {
    const getComputed = (r) => {
      const net = parseNumber(r.grossSales) - parseNumber(r.creditMemo) - parseNumber(r.returns);
      const ach = parseNumber(r.quota) ? (net / parseNumber(r.quota)) * 100 : 0;
      return { net, ach };
    };
    computedExtra = [
      { label: "Net Sales", width: 150, render: (row) => { const { net } = getComputed(row); return <span className={net < 0 ? "text-red-600 font-medium" : "font-medium"}>{net < 0 ? `(\u20b1${Math.abs(net).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : "\u20b1" + net.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>; } },
      { label: "Achievement %", width: 125, render: (row) => { const { ach } = getComputed(row); return <span className={ach < 0 ? "text-red-600 font-medium" : ach >= 100 ? "text-green-600 font-medium" : "text-slate-700"}>{ach.toFixed(2)}%</span>; } },
    ];
  }

  const suggestField = (header) => {
    const normalized = normalizeHeader(header);
    return fields.find((field) => {
      const candidates = [field.key, field.label, ...(HEADER_ALIASES[field.key] || [])].map(normalizeHeader);
      return candidates.includes(normalized);
    })?.key || "";
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let parsed = [];
      if (/\.xlsx?$/i.test(file.name)) {
        const { default: readXlsxFile } = await import("read-excel-file/browser");
        const workbookRows = /** @type {any[][]} */ (await /** @type {any} */ (readXlsxFile)(file));
        const headers = (workbookRows[0] || []).map((value, index) => String(value || `Column ${index + 1}`).trim());
        parsed = workbookRows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])))
          .filter((record) => Object.values(record).some((value) => value !== ""));
      } else {
        parsed = parseCSV(await file.text());
      }
      if (!parsed.length) {
        onImportToast("No rows found in file", "error");
        return;
      }
      const headers = [...new Set(parsed.flatMap((row) => Object.keys(row)))];
      setPendingImport({
        fileName: file.name,
        parsed,
        headers,
        mapping: Object.fromEntries(headers.map((header) => [header, suggestField(header)])),
      });
    } catch {
      onImportToast("The spreadsheet could not be read", "error");
    } finally {
      e.target.value = "";
    }
  };

  const applyImport = () => {
    if (!pendingImport) return;
    const selectedMappings = Object.values(pendingImport.mapping).filter(Boolean);
    if (!selectedMappings.length) {
      onImportToast("Map at least one spreadsheet column", "error");
      return;
    }
    const mapped = pendingImport.parsed.map((row) => {
      const out = {};
      fields.forEach((f) => {
        const src = pendingImport.headers.find((header) => pendingImport.mapping[header] === f.key);
        const raw = src ? row[src] : "";
        if (f.type === "currency" || f.type === "number") out[f.key] = parseNumber(raw);
        else if (f.type === "date" && raw) {
          const date = raw instanceof Date ? raw : new Date(raw);
          out[f.key] = Number.isNaN(date.getTime()) ? String(raw) : date.toISOString().slice(0, 10);
        } else out[f.key] = raw;
      });
      return out;
    });
    setRows(mapped);
    onImportToast(`Imported ${mapped.length} rows`, "success");
    setPendingImport(null);
  };

  const downloadTemplate = async () => {
    try {
      const { default: writeXlsxFile } = await import("write-excel-file/browser");
      const headerRow = fields.map((field) => ({
        value: field.label,
        fontWeight: "bold",
        backgroundColor: "#E2E8F0",
        align: "center",
      }));
      await /** @type {any} */ (writeXlsxFile)([headerRow], {
        columns: fields.map((field) => ({ width: Math.max(14, field.label.length + 2) })),
        fileName: `${dept.replace(/[^a-z0-9]+/gi, "_")}_template.xlsx`,
        sheet: "Report Data",
      });
      onImportToast("Excel template downloaded", "success");
    } catch {
      onImportToast("Template download failed", "error");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">
          Enter raw data only — all calculations, charts and summaries update automatically.
        </p>
        <div className="flex gap-2">
          <button onClick={downloadTemplate} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download size={14} /> Download Excel Template
          </button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Upload size={14} /> Import Excel/CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleImport} className="hidden" />
        </div>
      </div>
      {rows.length === 0 && (
        <div className="mb-3">
          <button onClick={addFirstRow} className="text-sm text-blue-600 hover:underline">+ Start with a sample row</button>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <DataTable fields={fields} rows={rows} onChange={setRows} computedExtra={computedExtra} searchPlaceholder="Search rows..." />
      </div>

      {pendingImport && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Map spreadsheet columns">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Map spreadsheet columns</h3>
                <p className="text-xs text-slate-500 mt-1">{pendingImport.fileName} · {pendingImport.parsed.length} row(s)</p>
              </div>
              <button onClick={() => setPendingImport(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Close mapping"><X size={17} /></button>
            </div>
            <div className="p-5 overflow-auto space-y-2">
              <div className="grid grid-cols-[1fr_28px_1fr] gap-3 text-[11px] uppercase tracking-wide text-slate-400 px-1">
                <span>Spreadsheet column</span><span /><span>WPCC report field</span>
              </div>
              {pendingImport.headers.map((header) => (
                <div key={header} className="grid grid-cols-[1fr_28px_1fr] gap-3 items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{header}</div>
                    <div className="text-xs text-slate-400 truncate">Example: {String(pendingImport.parsed[0]?.[header] ?? "—")}</div>
                  </div>
                  <span className="text-slate-300 text-center">→</span>
                  <select
                    value={pendingImport.mapping[header]}
                    onChange={(event) => setPendingImport({ ...pendingImport, mapping: { ...pendingImport.mapping, [header]: event.target.value } })}
                    className="input"
                  >
                    <option value="">Ignore this column</option>
                    {fields.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setPendingImport(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={applyImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Import mapped rows</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
