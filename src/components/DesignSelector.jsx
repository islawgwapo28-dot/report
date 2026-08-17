import { Check, Eye, LayoutDashboard } from "lucide-react";
import { TEMPLATES, COLOR_PRESETS, resolveTheme } from "@/lib/templates";

export default function DesignSelector({ design, onChange }) {
  const setTemplate = (id) => {
    onChange({ ...design, templateId: id, customColors: null });
  };
  const setCustom = (customColors) => {
    onChange({ ...design, customColors });
  };
  const resetCustom = () => onChange({ ...design, customColors: null });
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Report Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map((t) => {
            const active = design.templateId === t.id && !design.customColors;
            const c = t.colors;
            return (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`group relative text-left rounded-xl overflow-hidden border-2 transition-all ${
                  active ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="h-24 p-2 flex flex-col gap-1" style={{ background: c.bg }}>
                  <div className="h-3.5 rounded-sm" style={{ background: c.headerBg }} />
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-4 rounded-sm" style={{ background: c.cardBg, border: `1px solid ${c.border}` }} />)}
                  </div>
                  <div className="flex-1 grid grid-cols-[3fr_1fr] gap-1 min-h-0">
                    <div className="rounded-sm p-1 space-y-1" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                      {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-1 rounded-full" style={{ background: index % 2 ? c.cardBgAlt : c.border }} />)}
                    </div>
                    <div className="grid grid-rows-3 gap-1">
                      {Array.from({ length: 3 }).map((_, index) => <div key={index} className="rounded-sm" style={{ background: index === 0 ? c.accent : c.cardBg, border: `1px solid ${c.border}` }} />)}
                    </div>
                  </div>
                  <div className="h-2 rounded-sm" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }} />
                </div>
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-950/75 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"><Eye size={11} /> Preview</span>
                <div className="p-2.5 bg-white">
                  <div className="text-[13px] font-semibold text-slate-800 flex items-center justify-between">
                    {t.name}
                    {active && <Check size={14} className="text-blue-600" />}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{t.idealFor}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold tracking-wide text-slate-400"><LayoutDashboard size={10} /> LANDSCAPE · 1 PAGE</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Customize Theme</h3>
          {design.customColors && (
            <button onClick={resetCustom} className="text-xs text-blue-600 hover:underline">
              Reset to template
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(COLOR_PRESETS).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => setCustom(preset)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs hover:border-slate-400 transition-colors"
            >
              <span className="flex gap-0.5">
                <span className="w-3 h-3 rounded-full" style={{ background: preset.primary }} />
                <span className="w-3 h-3 rounded-full" style={{ background: preset.accent }} />
                <span className="w-3 h-3 rounded-full" style={{ background: preset.bg, border: "1px solid #ddd" }} />
              </span>
              {name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { k: "primary", label: "Primary Color" },
            { k: "secondary", label: "Secondary Color" },
            { k: "accent", label: "Accent Color" },
            { k: "bg", label: "Background Color" },
            { k: "headerBg", label: "Header Color" },
          ].map(({ k, label }) => (
            <ColorField
              key={k}
              label={label}
              value={(design.customColors || resolveTheme(design.templateId).colors)[k]}
              onChange={(v) => setCustom({ ...(design.customColors || resolveTheme(design.templateId).colors), [k]: v })}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-800">One-Page Layout</h3>
        <p className="text-xs text-slate-500 mt-1 mb-3">Every design uses the same 1672 × 941 management-ready landscape canvas and scales cleanly to A4 export.</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start gap-3">
          <LayoutDashboard size={18} className="text-blue-600 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-slate-700">Fixed for clean export</div>
            <div className="text-xs text-slate-500 mt-0.5">Header · 5 KPIs · detail table · 3 analytics panels · executive summary</div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Typography</h3>
          <label className="text-[11px] text-slate-500 font-medium">
            Report font
            <select value={design.fontFamily || "Inter"} onChange={(event) => onChange({ ...design, fontFamily: event.target.value })} className="input mt-1.5">
              <option value="Inter">Inter / System Sans</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia Serif</option>
            </select>
          </label>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Charts</h3>
          <SettingToggle label="Include analytics charts" checked={design.showCharts !== false} onChange={(checked) => onChange({ ...design, showCharts: checked })} />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Report Settings</h3>
        <div className="space-y-2">
          <SettingToggle label="Show company logo" checked={design.showLogo !== false} onChange={(checked) => onChange({ ...design, showLogo: checked })} />
          <SettingToggle label="Include executive summary" checked={design.showExecutiveSummary !== false} onChange={(checked) => onChange({ ...design, showExecutiveSummary: checked })} />
          <SettingToggle label="Show generated date" checked={design.showGeneratedDate !== false} onChange={(checked) => onChange({ ...design, showGeneratedDate: checked })} />
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 cursor-pointer">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] text-slate-500 font-medium">{label}</span>
      <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1.5">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs outline-none bg-transparent uppercase"
        />
      </div>
    </label>
  );
}
