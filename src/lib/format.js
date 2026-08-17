// Number & currency formatting utilities for WPCC reports

export function formatCurrency(n, decimals = 2) {
  const num = Number(n) || 0;
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString("en-PH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (num < 0) return `(\u20b1${formatted})`;
  return `\u20b1${formatted}`;
}

export function formatPercent(n, decimals = 2) {
  const num = Number(n) || 0;
  return `${num.toFixed(decimals)}%`;
}

export function formatNumber(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("en-PH");
}

// Compact for charts: ₱1.25M, ₱850K
export function formatCompactCurrency(n) {
  const num = Number(n) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}\u20b1${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}\u20b1${(abs / 1_000).toFixed(0)}K`;
  return `${sign}\u20b1${abs.toFixed(0)}`;
}

export function formatCompactNumber(n) {
  const num = Number(n) || 0;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

// Parse a possibly-formatted currency string into a number
export function parseNumber(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/[^\d.\-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function safeDivide(a, b, decimals = 2) {
  const na = Number(a) || 0;
  const nb = Number(b) || 0;
  if (nb === 0) return 0;
  return (na / nb) * 100;
}

export function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return d;
  }
}

export function dateRangeText(start, end) {
  if (!start && !end) return "";
  if (!end) return formatDate(start);
  if (!start) return formatDate(end);
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return `${formatDate(start)} \u2013 ${formatDate(end)}`;
  const fromMonth = from.toLocaleDateString("en-PH", { month: "long" });
  const toMonth = to.toLocaleDateString("en-PH", { month: "long" });
  const fromYear = from.getFullYear();
  const toYear = to.getFullYear();
  if (fromYear === toYear && fromMonth === toMonth) return `${fromMonth} ${from.getDate()}–${to.getDate()}, ${toYear}`;
  if (fromYear === toYear) return `${fromMonth} ${from.getDate()} – ${toMonth} ${to.getDate()}, ${toYear}`;
  return `${fromMonth} ${from.getDate()}, ${fromYear} – ${toMonth} ${to.getDate()}, ${toYear}`;
}

export function formatDateLong(d) {
  if (!d) return "";
  const date = new Date(`${d}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(d) : date.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
}

export function formatDateRangeSentence(start, end) {
  if (!start && !end) return "the reporting period";
  if (!end) return `From ${formatDateLong(start)}`;
  if (!start) return `From ${formatDateLong(end)}`;
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return `From ${formatDate(start)} to ${formatDate(end)}`;
  const fromMonth = from.toLocaleDateString("en-PH", { month: "long" });
  const toMonth = to.toLocaleDateString("en-PH", { month: "long" });
  if (from.getTime() === to.getTime()) return `On ${formatDateLong(start)}`;
  if (from.getFullYear() === to.getFullYear() && fromMonth === toMonth) return `From ${fromMonth} ${from.getDate()} to ${fromMonth} ${to.getDate()}, ${to.getFullYear()}`;
  return `From ${formatDateLong(start)} to ${formatDateLong(end)}`;
}
