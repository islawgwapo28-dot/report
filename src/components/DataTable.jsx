import { useState } from "react";
import { Plus, Copy, Trash2, Search, ArrowUpDown, Filter } from "lucide-react";
import StatusBadge from "./StatusBadge";

// Generic editable spreadsheet-style table.
// fields: [{key,label,type,options,width}]
// rows + onChange(rows)
// computedExtra: optional function(row, index) => [{label, value, render}] appended read-only columns
export default function DataTable({ fields, rows, onChange, computedExtra = null, searchPlaceholder = "Search..." }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [filterValue, setFilterValue] = useState("");
  const filterField = fields.find((field) => field.key === "status" || field.type === "status");
  const computedColumns = computedExtra ? (Array.isArray(computedExtra) ? computedExtra : [{ label: "Computed", render: computedExtra }]) : [];

  const updateRow = (i, key, val) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r));
    onChange(next);
  };

  const addRow = () => {
    const sample = rows.length ? { ...rows[rows.length - 1] } : {};
    fields.forEach((f) => {
      if (!(f.key in sample)) {
        sample[f.key] = f.type === "number" || f.type === "currency" || f.type === "percentage"
          ? 0
          : f.type === "checkbox" ? false : "";
      }
    });
    onChange([...rows, sample]);
  };
  const duplicateRow = (i) => {
    const next = [...rows];
    next.splice(i + 1, 0, { ...rows[i] });
    onChange(next);
  };
  const deleteRow = (i) => {
    if (window.confirm(`Delete row ${i + 1}? This action cannot be undone.`)) {
      onChange(rows.filter((_, idx) => idx !== i));
    }
  };

  let displayRows = rows.map((r, i) => ({ row: r, index: i }));
  if (search.trim()) {
    const q = search.toLowerCase();
    displayRows = displayRows.filter(({ row }) =>
      Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }
  if (filterValue && filterField) {
    displayRows = displayRows.filter(({ row }) => String(row[filterField.key] || "") === filterValue);
  }
  if (sort.key) {
    displayRows.sort((a, b) => {
      const av = a.row[sort.key];
      const bv = b.row[sort.key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
      return String(av ?? "").localeCompare(String(bv ?? "")) * sort.dir;
    });
  }

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }));
  };

  const focusNextCell = (event, rowIndex, fieldIndex) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const nextField = fieldIndex + 1 < fields.length ? fieldIndex + 1 : 0;
    const nextRow = fieldIndex + 1 < fields.length ? rowIndex : rowIndex + 1;
    const nextCell = document.querySelector(`[data-grid-cell="${nextRow}-${nextField}"]`);
    if (nextCell instanceof HTMLElement) nextCell.focus();
  };

  const renderCell = (f, row, i, fieldIndex) => {
    if (f.type === "select" || f.type === "status") {
      const options = f.options || ["Completed", "In Progress", "Pending", "On Hold", "Cancelled"];
      return (
        <select
          data-grid-cell={`${i}-${fieldIndex}`}
          value={row[f.key] || ""}
          onChange={(e) => updateRow(i, f.key, e.target.value)}
          onKeyDown={(e) => focusNextCell(e, i, fieldIndex)}
          className="w-full bg-transparent text-sm outline-none border-0 focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-1"
        >
          <option value="">—</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    }
    if (f.type === "date") {
      return (
        <input
          data-grid-cell={`${i}-${fieldIndex}`}
          type="date"
          value={row[f.key] || ""}
          onChange={(e) => updateRow(i, f.key, e.target.value)}
          onKeyDown={(e) => focusNextCell(e, i, fieldIndex)}
          className="w-full bg-transparent text-sm outline-none border-0 focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-1"
        />
      );
    }
    if (f.type === "checkbox") {
      return (
        <div className="flex justify-center">
          <input
            data-grid-cell={`${i}-${fieldIndex}`}
            type="checkbox"
            checked={Boolean(row[f.key])}
            onChange={(e) => updateRow(i, f.key, e.target.checked)}
            onKeyDown={(e) => focusNextCell(e, i, fieldIndex)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      );
    }
    return (
      <input
        data-grid-cell={`${i}-${fieldIndex}`}
        type={["currency", "number", "percentage"].includes(f.type) ? "number" : "text"}
        step={["currency", "number", "percentage"].includes(f.type) ? "any" : undefined}
        value={row[f.key] ?? ""}
        onChange={(e) => updateRow(i, f.key, e.target.value)}
        onKeyDown={(e) => focusNextCell(e, i, fieldIndex)}
        placeholder={f.label}
        className="w-full bg-transparent text-sm outline-none border-0 focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-1"
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {filterField && (
          <label className="relative">
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white">
              <option value="">All statuses</option>
              {(filterField.options || ["Completed", "In Progress", "Pending", "On Hold", "Cancelled"]).map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        )}
        <div className="flex gap-2">
          <button onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={14} /> Add Row
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-200" style={{ maxHeight: "100%" }}>
        <table className="w-full text-sm border-collapse" style={{ minWidth: "max-content" }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 text-slate-600">
              <th className="w-10 px-2 py-2.5 text-left font-medium border-b border-slate-200">#</th>
              {fields.map((f) => (
                <th
                  key={f.key}
                  className="px-2 py-2.5 text-left font-medium border-b border-slate-200 whitespace-nowrap"
                  style={{ minWidth: f.width || "120px" }}
                >
                  <button onClick={() => toggleSort(f.key)} className="inline-flex items-center gap-1 hover:text-slate-900">
                    {f.label}
                    <ArrowUpDown size={11} className="opacity-40" />
                  </button>
                </th>
              ))}
              {computedColumns.map((column) => <th key={column.label} className="px-2 py-2.5 text-right font-medium border-b border-slate-200 whitespace-nowrap" style={{ minWidth: column.width || 120 }}>{column.label}</th>)}
              <th className="w-24 px-2 py-2.5 text-center font-medium border-b border-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={fields.length + computedColumns.length + 2} className="text-center text-slate-400 py-10 text-sm">
                  No rows yet. Click “Add Row” to begin.
                </td>
              </tr>
            )}
            {displayRows.map(({ row, index }) => (
              <tr key={index} className="group hover:bg-blue-50/40 transition-colors border-b border-slate-100">
                <td className="px-2 py-1 text-slate-400 text-xs">{index + 1}</td>
                {fields.map((f, fieldIndex) => (
                  <td key={f.key} className="px-0.5 py-0.5 border-l border-slate-100 align-middle">
                    {renderCell(f, row, index, fieldIndex)}
                  </td>
                ))}
                {computedColumns.map((column) => (
                  <td key={column.label} className="px-2 py-1 text-xs text-right text-slate-600">{column.render(row, index)}</td>
                ))}
                <td className="px-2 py-1 text-center">
                  <div className="flex items-center justify-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => duplicateRow(index)} title="Duplicate Row" className="p-1 rounded hover:bg-slate-200 text-slate-500">
                      <Copy size={13} />
                    </button>
                    <button onClick={() => deleteRow(index)} title="Delete Row" className="p-1 rounded hover:bg-red-100 text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Read-only rendered table for preview (no editing controls)
export function ReadOnlyTable({ fields, rows, computedExtra = null, theme }) {
  const textColor = theme?.colors?.text || "#1f2937";
  const muted = theme?.colors?.textMuted || "#6b7280";
  const border = theme?.colors?.border || "#e5e7eb";
  const headBg = theme?.colors?.headerBg || "#1e3a5f";
  const headText = theme?.colors?.headerText || "#fff";
  const computedColumns = computedExtra ? (Array.isArray(computedExtra) ? computedExtra : [{ label: "Computed", render: computedExtra }]) : [];

  const renderVal = (f, row) => {
    const v = row[f.key];
    if (f.type === "currency") {
      const n = Number(v) || 0;
      const s = n < 0 ? `(\u20b1${Math.abs(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `\u20b1${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return <span style={{ color: n < 0 ? theme?.colors?.danger : textColor }}>{s}</span>;
    }
    if (f.type === "number") return Number(v || 0).toLocaleString("en-PH");
    if (f.type === "percentage") return `${(Number(v) || 0).toFixed(2)}%`;
    if (f.type === "checkbox") return v ? "Yes" : "No";
    if (f.type === "date") {
      try { return new Date(v).toLocaleDateString("en-PH"); } catch { return v; }
    }
    if ((f.type === "select" && (f.key === "status" || f.key === "followUp")) || f.type === "status") {
      return <StatusBadge value={v} />;
    }
    if (f.type === "select" && f.key === "priority") {
      return <StatusBadge value={v} kind="priority" />;
    }
    return v || "—";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: headBg, color: headText }}>
            <th className="px-2.5 py-2 text-left font-semibold" style={{ minWidth: "36px" }}>#</th>
            {fields.map((f) => (
              <th key={f.key} className="px-2.5 py-2 text-left font-semibold whitespace-nowrap" style={{ minWidth: f.width || "120px" }}>
                {f.label}
              </th>
            ))}
            {computedColumns.map((column) => <th key={column.label} className="px-2.5 py-2 text-right font-semibold whitespace-nowrap">{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={fields.length + computedColumns.length + 1} className="text-center py-8" style={{ color: muted }}>No data</td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${border}`, color: textColor }}>
              <td className="px-2.5 py-1.5 text-xs" style={{ color: muted }}>{i + 1}</td>
              {fields.map((f) => (
                <td key={f.key} className="px-2.5 py-1.5" style={{ minWidth: f.width || "120px" }}>
                  {renderVal(f, row)}
                </td>
              ))}
              {computedColumns.map((column) => <td key={column.label} className="px-2.5 py-1.5 text-right">{column.render(row, i)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
