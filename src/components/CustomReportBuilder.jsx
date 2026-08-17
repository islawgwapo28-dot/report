import { Plus, Trash2, GripVertical } from "lucide-react";
import DataTable from "./DataTable";
import { COLUMN_TYPES, CALC_TYPES } from "@/lib/departments";

export default function CustomReportBuilder({ report, setReport }) {
  const config = report.customConfig || { columns: [], rows: [] };
  const columns = config.columns || [];
  const rows = config.rows || [];

  const setColumns = (next) => setReport({ ...report, customConfig: { ...config, columns: next } });
  const setRows = (next) => setReport({ ...report, customConfig: { ...config, rows: next } });

  const addColumn = () => {
    const name = `Column ${columns.length + 1}`;
    setColumns([...columns, { id: `col_${Date.now().toString(36)}`, name, type: "Text", calc: "None" }]);
  };
  const updateCol = (i, patch) => {
    setColumns(columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };
  const removeCol = (i) => {
    if (!window.confirm(`Delete "${columns[i].name}" and remove it from this report?`)) return;
    const key = columns[i].id || columns[i].name;
    const nextRows = rows.map((row) => {
      const next = { ...row };
      delete next[key];
      return next;
    });
    setReport({
      ...report,
      customConfig: { ...config, columns: columns.filter((_, idx) => idx !== i), rows: nextRows },
    });
  };

  const reorderColumn = (from, to) => {
    if (from === to) return;
    const next = [...columns];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setColumns(next);
  };

  const fields = columns.map((col) => ({
    key: col.id || col.name,
    label: col.name,
    type: col.type.toLowerCase() === "dropdown" ? "select" : col.type.toLowerCase(),
    options: col.type === "Dropdown"
      ? (col.options || "").split(",").map((s) => s.trim()).filter(Boolean)
      : col.type === "Status" ? ["Completed", "In Progress", "Pending", "On Hold", "Cancelled"] : undefined,
    width: "150px",
  }));

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700">Custom Columns</h4>
          <button onClick={addColumn} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={14} /> Add Column
          </button>
        </div>
        {columns.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg">
            No columns yet. Click “Add Column” to define your report structure.
          </div>
        ) : (
          <div className="space-y-2">
            {columns.map((col, i) => (
              <div
                key={col.id || i}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/column-index", String(i))}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => reorderColumn(Number(event.dataTransfer.getData("text/column-index")), i)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <GripVertical size={16} className="text-slate-300 cursor-grab" aria-label="Drag to reorder column" />
                <input
                  value={col.name}
                  onChange={(e) => updateCol(i, { name: e.target.value })}
                  className="flex-1 text-sm outline-none border-0 bg-transparent font-medium"
                  placeholder="Column name"
                />
                <select value={col.type} onChange={(e) => updateCol(i, { type: e.target.value })} className="text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none">
                  {COLUMN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={col.calc || "None"} onChange={(e) => updateCol(i, { calc: e.target.value })} className="text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none">
                  {CALC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {col.type === "Dropdown" && (
                  <input
                    value={col.options || ""}
                    onChange={(e) => updateCol(i, { options: e.target.value })}
                    placeholder="opt1, opt2"
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none w-32"
                  />
                )}
                <button onClick={() => removeCol(i)} className="p-1 rounded hover:bg-red-100 text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {columns.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Data Entry</h4>
          <div className="flex-1 min-h-0">
            <DataTable fields={fields} rows={rows} onChange={setRows} searchPlaceholder="Search rows..." />
          </div>
        </div>
      )}
    </div>
  );
}
