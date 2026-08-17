// Presentation layer: every template renders the same report data and calculations.
// The shared 1672 x 941 landscape canvas is presentation-only; templates only change visual tokens.

const makeTemplate = (id, name, tagline, idealFor, colors, visual = {}) => ({
  id,
  name,
  tagline,
  idealFor,
  layout: "landscape",
  pageCount: 1,
  colors,
  visual: {
    radius: 10,
    shadow: "0 2px 8px rgba(15, 23, 42, .08)",
    headerStyle: "solid",
    ...visual,
  },
});

export const TEMPLATES = [
  makeTemplate("darkblue", "Corporate Dark Blue", "Modern command center", "IT / Technical reports", {
    bg: "#03142f", headerBg: "#041a3b", cardBg: "#071e40", cardBgAlt: "#09264e",
    text: "#f1f6ff", textMuted: "#9aaccc", primary: "#0a2b59", secondary: "#115fc9",
    accent: "#13b8d4", accent2: "#3278ed", border: "#17406c", success: "#10c98d",
    warning: "#ff961f", danger: "#f05252", info: "#2f7cf5", headerText: "#ffffff",
    chartColors: ["#10c98d", "#2f7cf5", "#ff961f", "#f05252", "#13b8d4", "#8b5cf6"],
  }, { radius: 10, shadow: "0 6px 18px rgba(0, 0, 0, .18)" }),
  makeTemplate("executive-red", "Executive Red", "Strong boardroom presentation", "Sales reports", {
    bg: "#f8fafc", headerBg: "#a70f1b", cardBg: "#ffffff", cardBgAlt: "#fff5f5",
    text: "#1d2635", textMuted: "#687386", primary: "#9f111c", secondary: "#d32937",
    accent: "#c71928", accent2: "#ef5a67", border: "#ead4d6", success: "#14804a",
    warning: "#d97706", danger: "#c71928", info: "#1d64c8", headerText: "#ffffff",
    chartColors: ["#c71928", "#ef5a67", "#f59e0b", "#14804a", "#1d64c8", "#7c3aed"],
  }, { radius: 6, headerStyle: "band" }),
  makeTemplate("corporate-green", "Corporate Green", "Calm weekly performance view", "Marketing / Weekly reports", {
    bg: "#f7faf8", headerBg: "#124b35", cardBg: "#ffffff", cardBgAlt: "#edf8f1",
    text: "#173329", textMuted: "#64786f", primary: "#14533a", secondary: "#277a56",
    accent: "#1c9a62", accent2: "#58bd83", border: "#cfe4d8", success: "#168451",
    warning: "#d88812", danger: "#cf3b3b", info: "#207a9a", headerText: "#ffffff",
    chartColors: ["#168451", "#58bd83", "#14533a", "#d88812", "#207a9a", "#cf3b3b"],
  }, { radius: 8 }),
  makeTemplate("modern-white", "Modern White", "Minimal and highly readable", "Any department", {
    bg: "#f6f8fb", headerBg: "#183759", cardBg: "#ffffff", cardBgAlt: "#f2f5f9",
    text: "#1e293b", textMuted: "#64748b", primary: "#183759", secondary: "#385778",
    accent: "#2469ce", accent2: "#6c829e", border: "#dce3eb", success: "#168451",
    warning: "#d88812", danger: "#d13b3b", info: "#2469ce", headerText: "#ffffff",
    chartColors: ["#2469ce", "#6c829e", "#183759", "#168451", "#d88812", "#d13b3b"],
  }, { radius: 4, shadow: "0 1px 3px rgba(15, 23, 42, .07)" }),
  makeTemplate("black-gold", "Black & Gold", "Premium executive dashboard", "Executive management", {
    bg: "#0c0c0d", headerBg: "#151516", cardBg: "#171719", cardBgAlt: "#202023",
    text: "#f7f3e8", textMuted: "#aaa394", primary: "#24211b", secondary: "#65532b",
    accent: "#d2ad54", accent2: "#f0d187", border: "#443a26", success: "#58b985",
    warning: "#d2ad54", danger: "#ef6161", info: "#d2ad54", headerText: "#f0d187",
    chartColors: ["#d2ad54", "#f0d187", "#58b985", "#d98239", "#ef6161", "#89734a"],
  }, { radius: 2, shadow: "0 8px 22px rgba(0, 0, 0, .3)" }),
  makeTemplate("industrial-orange", "Industrial Orange", "Rugged WPCC operations view", "Operations / Technical", {
    bg: "#181a1d", headerBg: "#24272b", cardBg: "#25282c", cardBgAlt: "#30343a",
    text: "#f5f6f7", textMuted: "#adb2b8", primary: "#34383d", secondary: "#646b73",
    accent: "#f47a22", accent2: "#ff9a4f", border: "#474c52", success: "#38b978",
    warning: "#f3a12c", danger: "#e95656", info: "#f47a22", headerText: "#ffffff",
    chartColors: ["#f47a22", "#ff9a4f", "#38b978", "#f3a12c", "#e95656", "#9ca3af"],
  }, { radius: 3 }),
  makeTemplate("wpcc-crimson", "WPCC Crimson", "Branded leadership briefing", "Company-wide reports", {
    bg: "#f7f7f8", headerBg: "#111c2d", cardBg: "#ffffff", cardBgAlt: "#f5f0f1",
    text: "#202938", textMuted: "#6a7280", primary: "#111c2d", secondary: "#7f1520",
    accent: "#b61c2a", accent2: "#db5662", border: "#dedfe3", success: "#218355",
    warning: "#d68016", danger: "#b61c2a", info: "#2a609e", headerText: "#ffffff",
    chartColors: ["#b61c2a", "#111c2d", "#db5662", "#218355", "#d68016", "#2a609e"],
  }, { radius: 6, headerStyle: "split" }),
  makeTemplate("steel-blue", "Steel Blue", "Precise technical scorecard", "Inventory / Engineering", {
    bg: "#eef3f7", headerBg: "#29485e", cardBg: "#ffffff", cardBgAlt: "#e4edf3",
    text: "#203746", textMuted: "#637986", primary: "#29485e", secondary: "#4f7187",
    accent: "#1689a7", accent2: "#49abc2", border: "#c8d8e1", success: "#278360",
    warning: "#cc7b20", danger: "#c94b4b", info: "#2873a4", headerText: "#ffffff",
    chartColors: ["#1689a7", "#49abc2", "#29485e", "#278360", "#cc7b20", "#c94b4b"],
  }, { radius: 5 }),
  makeTemplate("graphite-teal", "Graphite Teal", "Focused dark analytics", "Digital / Online teams", {
    bg: "#111719", headerBg: "#172326", cardBg: "#19272a", cardBgAlt: "#213235",
    text: "#eff8f7", textMuted: "#9ab2af", primary: "#203437", secondary: "#146d6b",
    accent: "#20b8a9", accent2: "#56d2c6", border: "#315155", success: "#45c48a",
    warning: "#e8a23a", danger: "#e85d64", info: "#3aa3c9", headerText: "#ffffff",
    chartColors: ["#20b8a9", "#56d2c6", "#3aa3c9", "#45c48a", "#e8a23a", "#e85d64"],
  }, { radius: 12, shadow: "0 7px 20px rgba(0, 0, 0, .22)" }),
  makeTemplate("burgundy-ivory", "Burgundy Ivory", "Classic annual review", "HR / Annual reports", {
    bg: "#f8f3ea", headerBg: "#5d1c2b", cardBg: "#fffdf8", cardBgAlt: "#f3e9dc",
    text: "#3b2c2b", textMuted: "#7f6d68", primary: "#5d1c2b", secondary: "#8c4150",
    accent: "#9b3449", accent2: "#ba8b45", border: "#decfbd", success: "#39795a",
    warning: "#b87925", danger: "#b8393f", info: "#556d98", headerText: "#fffaf2",
    chartColors: ["#9b3449", "#ba8b45", "#5d1c2b", "#39795a", "#b87925", "#556d98"],
  }, { radius: 1, headerStyle: "classic" }),
  makeTemplate("navy-cyan", "Navy Cyan", "High-clarity technology brief", "IT / Engineering reports", {
    bg: "#061326", headerBg: "#0b223e", cardBg: "#0c2948", cardBgAlt: "#123756",
    text: "#f2f8ff", textMuted: "#9bb4c9", primary: "#0d2f52", secondary: "#155d88",
    accent: "#38d4e6", accent2: "#4d9df4", border: "#1c4e73", success: "#20c98a",
    warning: "#f4a42d", danger: "#f15d65", info: "#4d9df4", headerText: "#ffffff",
    chartColors: ["#38d4e6", "#4d9df4", "#20c98a", "#f4a42d", "#f15d65", "#9b8cff"],
  }, { radius: 7, shadow: "0 5px 15px rgba(0, 0, 0, .2)" }),
  makeTemplate("slate-emerald", "Slate Emerald", "Balanced operations scorecard", "Operations / Inventory", {
    bg: "#f1f5f4", headerBg: "#24343a", cardBg: "#ffffff", cardBgAlt: "#e7f1ef",
    text: "#1f3033", textMuted: "#667779", primary: "#24343a", secondary: "#3d5e60",
    accent: "#138b77", accent2: "#43bfa3", border: "#cbded9", success: "#15966f",
    warning: "#c88322", danger: "#c94d50", info: "#317ca0", headerText: "#ffffff",
    chartColors: ["#138b77", "#43bfa3", "#317ca0", "#15966f", "#c88322", "#c94d50"],
  }, { radius: 5 }),
  makeTemplate("royal-purple", "Royal Purple", "Creative performance brief", "Marketing / Custom reports", {
    bg: "#f7f5fb", headerBg: "#302255", cardBg: "#ffffff", cardBgAlt: "#f0ebfb",
    text: "#29233a", textMuted: "#756d88", primary: "#302255", secondary: "#58418a",
    accent: "#7657d9", accent2: "#a786f1", border: "#ddd4f2", success: "#27946e",
    warning: "#d08a2a", danger: "#c94c62", info: "#4a86bd", headerText: "#ffffff",
    chartColors: ["#7657d9", "#a786f1", "#4a86bd", "#27946e", "#d08a2a", "#c94c62"],
  }, { radius: 9, shadow: "0 3px 12px rgba(48, 34, 85, .12)" }),
  makeTemplate("paper-blue", "Paper Blue", "Clean management memo", "Executive / Annual reports", {
    bg: "#fbfcfe", headerBg: "#223957", cardBg: "#ffffff", cardBgAlt: "#f1f5fa",
    text: "#27384d", textMuted: "#6c7c8e", primary: "#223957", secondary: "#4d6b8b",
    accent: "#2579c7", accent2: "#6ca8dc", border: "#d8e1eb", success: "#23835a",
    warning: "#c9821d", danger: "#c84c52", info: "#2579c7", headerText: "#ffffff",
    chartColors: ["#2579c7", "#6ca8dc", "#223957", "#23835a", "#c9821d", "#c84c52"],
  }, { radius: 3, shadow: "0 1px 4px rgba(34, 57, 87, .08)" }),
];

export const COLOR_PRESETS = {
  "WPCC Red": { primary: "#9f111c", secondary: "#d32937", accent: "#c71928", bg: "#f8fafc", headerBg: "#a70f1b" },
  "WPCC Green": { primary: "#14533a", secondary: "#277a56", accent: "#1c9a62", bg: "#f7faf8", headerBg: "#124b35" },
  "Corporate Blue": { primary: "#183759", secondary: "#385778", accent: "#2469ce", bg: "#f6f8fb", headerBg: "#183759" },
  "Industrial Orange": { primary: "#34383d", secondary: "#646b73", accent: "#f47a22", bg: "#181a1d", headerBg: "#24272b" },
  "Executive Gold": { primary: "#24211b", secondary: "#65532b", accent: "#d2ad54", bg: "#0c0c0d", headerBg: "#151516" },
  "Dark Mode": { primary: "#0a2b59", secondary: "#115fc9", accent: "#13b8d4", bg: "#03142f", headerBg: "#041a3b" },
};

export function getTemplate(id) {
  return TEMPLATES.find((template) => template.id === id) || TEMPLATES[0];
}

export function resolveTheme(templateId, customColors) {
  const base = getTemplate(templateId);
  if (!customColors) return base;
  return { ...base, colors: { ...base.colors, ...customColors } };
}
