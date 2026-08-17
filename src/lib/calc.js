// Calculation engine — computes all derived metrics from raw report data.
// Data layer → Calculation layer. Pure functions, no UI.

import { formatDateRangeSentence, parseNumber } from "./format.js";

// ---------- Activity-based departments (IT, HR, Operations, Inventory, Technical) ----------
export function calcActivity(rows) {
  const list = (rows || []).filter((row) => row.employee || row.duty || row.activity || row.description || row.remarks);
  const total = list.length;
  const byStatus = (status) => list.filter((row) => normalizeLabel(row.status) === normalizeLabel(status)).length;
  const completed = byStatus("Completed");
  const inProgress = byStatus("In Progress");
  const pending = byStatus("Pending");
  const onHold = byStatus("On Hold");
  const cancelled = byStatus("Cancelled");
  const completionRate = total ? (completed / total) * 100 : 0;

  const byPriority = (priorityName) => list.filter((row) => normalizeLabel(row.priority) === normalizeLabel(priorityName)).length;
  const priority = {
    Critical: byPriority("Critical"),
    High: byPriority("High"),
    Medium: byPriority("Medium"),
    Low: byPriority("Low"),
  };

  // Employee contribution
  const empMap = {};
  list.forEach((r) => {
    const name = (r.employee || "Unassigned").trim() || "Unassigned";
    empMap[name] = (empMap[name] || 0) + 1;
  });
  const employeeContribution = Object.entries(empMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Per date
  const dateMap = {};
  list.forEach((r) => {
    const d = r.date || "No Date";
    dateMap[d] = (dateMap[d] || 0) + 1;
  });
  const perDate = Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningTotal = 0;
  let runningCompleted = 0;
  const trendMap = {};
  [...list]
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
    .forEach((row) => {
      const date = row.date || "No Date";
      runningTotal += 1;
      if (normalizeLabel(row.status) === "completed") runningCompleted += 1;
      trendMap[date] = { date, rate: runningTotal ? (runningCompleted / runningTotal) * 100 : 0 };
    });
  const completionTrend = Object.values(trendMap);

  return {
    rows: list,
    total, completed, inProgress, pending, onHold, cancelled,
    completionRate,
    priority,
    employeeContribution,
    perDate, completionTrend,
  };
}

// ---------- Sales ----------
export function calcSales(rows) {
  const list = (rows || []).filter((row) => row.salesperson || parseNumber(row.quota) || parseNumber(row.grossSales) || parseNumber(row.creditMemo) || parseNumber(row.returns) || row.remarks).map((r) => ({
    ...r,
    quota: parseNumber(r.quota),
    grossSales: parseNumber(r.grossSales),
    creditMemo: parseNumber(r.creditMemo),
    returns: parseNumber(r.returns),
  }));
  const computed = list.map((r) => {
    const netSales = r.grossSales - r.creditMemo - r.returns;
    const achievement = r.quota ? (netSales / r.quota) * 100 : 0;
    return { ...r, netSales, achievement };
  });

  const totalTarget = computed.reduce((s, r) => s + r.quota, 0);
  const totalGross = computed.reduce((s, r) => s + r.grossSales, 0);
  const totalCM = computed.reduce((s, r) => s + r.creditMemo, 0);
  const totalAdjustments = computed.reduce((s, r) => s + r.returns, 0);
  const totalNet = computed.reduce((s, r) => s + r.netSales, 0);
  const overallAchievement = totalTarget ? (totalNet / totalTarget) * 100 : 0;
  const avgAchievement = computed.length
    ? computed.reduce((s, r) => s + r.achievement, 0) / computed.length
    : 0;

  const ranked = [...computed].sort((a, b) => b.achievement - a.achievement);
  const top = ranked[0] || null;
  const bottom = ranked[ranked.length - 1] || null;
  const aboveTarget = computed.filter((r) => r.achievement >= 100).length;
  const belowTarget = computed.filter((r) => r.achievement < 100).length;

  return {
    rows: computed,
    totalTarget, totalGross, totalCM, totalAdjustments, totalNet,
    overallAchievement, avgAchievement,
    top, bottom, aboveTarget, belowTarget,
    ranking: ranked.map((r, i) => ({ rank: i + 1, ...r })),
  };
}

// ---------- Marketing ----------
export function calcMarketing(rows) {
  const list = (rows || []).filter((row) => row.activity || row.product || parseNumber(row.inquiries) || parseNumber(row.leads) || parseNumber(row.orders) || parseNumber(row.salesAmount) || row.remarks);
  const total = list.length;
  const completed = list.filter((row) => normalizeLabel(row.status) === "completed").length;
  const pending = list.filter((row) => normalizeLabel(row.status) === "pending").length;
  const inProgress = list.filter((row) => normalizeLabel(row.status) === "in progress").length;
  const completionRate = total ? (completed / total) * 100 : 0;

  const totalInquiries = list.reduce((s, r) => s + parseNumber(r.inquiries), 0);
  const totalLeads = list.reduce((s, r) => s + parseNumber(r.leads), 0);
  const totalOrders = list.reduce((s, r) => s + parseNumber(r.orders), 0);
  const totalSales = list.reduce((s, r) => s + parseNumber(r.salesAmount), 0);

  const platformMap = {};
  const rowsByPlatform = {};
  list.forEach((r) => {
    const p = r.platform || "Other";
    platformMap[p] = (platformMap[p] || 0) + 1;
    if (!rowsByPlatform[p]) rowsByPlatform[p] = { inquiries: 0, leads: 0, orders: 0, sales: 0 };
    rowsByPlatform[p].inquiries += parseNumber(r.inquiries);
    rowsByPlatform[p].leads += parseNumber(r.leads);
    rowsByPlatform[p].orders += parseNumber(r.orders);
    rowsByPlatform[p].sales += parseNumber(r.salesAmount);
  });
  const byPlatform = Object.entries(platformMap).map(([name, count]) => ({ name, count }));

  const campaignMap = {};
  list.forEach((r) => {
    const c = r.campaignType || "Other";
    campaignMap[c] = (campaignMap[c] || 0) + 1;
  });
  const byCampaign = Object.entries(campaignMap).map(([name, count]) => ({ name, count }));

  const dateMap = {};
  list.forEach((r) => {
    const d = r.date || "No Date";
    if (!dateMap[d]) dateMap[d] = { count: 0, orders: 0, sales: 0 };
    dateMap[d].count += 1;
    dateMap[d].orders += parseNumber(r.orders);
    dateMap[d].sales += parseNumber(r.salesAmount);
  });
  const byDate = Object.entries(dateMap)
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    rows: list,
    total, completed, pending, inProgress, completionRate,
    totalInquiries, totalLeads, totalOrders, totalSales,
    campaignCount: Object.keys(campaignMap).length,
    platformCount: Object.keys(platformMap).length,
    byPlatform, byCampaign, byDate, rowsByPlatform,
  };
}

// ---------- Custom report ----------
export function calcCustom(columns, rows) {
  const cols = columns || [];
  const list = (rows || []).filter((row) => Object.values(row || {}).some((value) => value !== "" && value != null && value !== false));
  const results = {};
  cols.forEach((c) => {
    const key = c.id || c.name;
    const rawValues = list.map((row) => row[key]);
    const populatedValues = rawValues.filter((value) => value !== "" && value != null);
    const values = populatedValues.map(parseNumber);
    let result;
    switch (c.calc) {
      case "Sum":
        result = values.reduce((s, v) => s + v, 0);
        break;
      case "Average":
        result = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
        break;
      case "Count":
        result = populatedValues.length;
        break;
      case "Minimum":
        result = values.length ? Math.min(...values) : 0;
        break;
      case "Maximum":
        result = values.length ? Math.max(...values) : 0;
        break;
      case "Percentage":
        // percentage columns stored already as numbers; average them
        result = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
        break;
      default:
        result = null;
    }
    results[key] = result;
  });
  return { rows: list, rowCount: list.length, results };
}

// ---------- Executive summary text generation ----------
export function buildExecutiveSummary(report, calc) {
  const info = report.info || {};
  const dept = displayWords(info.department || report.department || "company");
  const fallbackDates = (calc?.rows || []).map((row) => row.date).filter(Boolean).sort();
  const periodStart = info.startDate || fallbackDates[0] || "";
  const periodEnd = info.endDate || fallbackDates[fallbackDates.length - 1] || periodStart;
  const period = formatDateRangeSentence(periodStart, periodEnd);
  const branch = normalizeBranch(info.branch);
  const prepared = info.preparedBy ? ` Prepared by ${displayWords(info.preparedBy)}.` : "";

  if (report.department === "Sales" && calc) {
    const people = pluralize(calc.aboveTarget, "salesperson", "salespeople");
    return `${period}${branch ? `, ${branch}` : ""}, the Sales team generated ${fmtPeso(calc.totalNet)} in Net Sales against an assigned target of ${fmtPeso(calc.totalTarget)}, achieving ${calc.overallAchievement.toFixed(2)}% overall performance. ${calc.top ? `${displayWords(calc.top.salesperson || "The top performer")} led with ${calc.top.achievement.toFixed(2)}% achievement.` : ""} ${calc.aboveTarget} ${people} met or exceeded target while ${calc.belowTarget} were below target.${prepared}`;
  }

  if (report.department === "Marketing / Online Sales" && calc) {
    const openText = activityOpenText(calc);
    return `${period}, the Marketing / Online Sales team logged ${calc.total} ${pluralize(calc.total, "activity", "activities")} across ${calc.platformCount} ${pluralize(calc.platformCount, "platform", "platforms")} and ${calc.campaignCount} ${pluralize(calc.campaignCount, "campaign type", "campaign types")}. ${calc.completed} ${pluralize(calc.completed, "activity", "activities")} ${verbWasWere(calc.completed)} completed${openText ? ` while ${openText}` : ""}, yielding a ${calc.completionRate.toFixed(2)}% completion rate. The team generated ${calc.totalInquiries} ${pluralize(calc.totalInquiries, "customer inquiry", "customer inquiries")}, ${calc.totalLeads} ${pluralize(calc.totalLeads, "lead", "leads")}, and ${calc.totalOrders} ${pluralize(calc.totalOrders, "order", "orders")} totaling ${fmtPeso(calc.totalSales)} in sales.${prepared}`;
  }

  if (report.department === "Custom Report" && calc) {
    const calculated = (report.customConfig?.columns || []).filter((column) => column.calc && column.calc !== "None").length;
    return `${period}, this custom report contains ${calc.rowCount} ${pluralize(calc.rowCount, "record", "records")} across ${(report.customConfig?.columns || []).length} configured columns. ${calculated} automatic ${pluralize(calculated, "calculation", "calculations")} ${verbWasWere(calculated)} included in the performance summary.${prepared}`;
  }

  // Activity-style (IT / HR / Operations / Inventory / Technical / Custom default)
  if (calc && typeof calc.total === "number") {
    const emp = calc.employeeContribution.slice(0, 3);
    const openText = activityOpenText(calc);
    const activityWord = pluralize(calc.total, "activity", "activities");
    const completedWord = pluralize(calc.completed, "activity", "activities");
    const contributionText = formatContributors(emp);
    return `${period}${branch ? `, ${branch}` : ""}, the ${dept} team recorded ${calc.total} ${activityWord}. ${calc.completed} ${completedWord} ${verbWasWere(calc.completed)} completed${openText ? ` while ${openText}` : ""}, resulting in a completion rate of ${calc.completionRate.toFixed(2)}%.${contributionText ? ` ${contributionText}.` : ""}${prepared}`;
  }

  return `Report for ${period}.${prepared}`;
}

export function pluralize(count, singular, plural) {
  return Number(count) === 1 ? singular : plural;
}

export function verbWasWere(count) {
  return Number(count) === 1 ? "was" : "were";
}

export function verbRemains(count) {
  return Number(count) === 1 ? "remains" : "remain";
}

function formatContributors(people) {
  if (!people.length) return "";
  if (people.length === 1) return `The top contributor was ${displayWords(people[0].name)} with ${people[0].count} ${pluralize(people[0].count, "activity", "activities")}`;
  if (people.length === 2 && people[0].count === people[1].count) return `${displayWords(people[0].name)} and ${displayWords(people[1].name)} contributed ${people[0].count} ${pluralize(people[0].count, "activity", "activities")} each`;
  return `Top contributors were ${people.map((person) => `${displayWords(person.name)} (${person.count} ${pluralize(person.count, "activity", "activities")})`).join(", ")}`;
}

function normalizeBranch(value) {
  const branch = displayWords(value);
  if (!branch) return "";
  return /\bbranch\b/i.test(branch) ? branch : `${branch} Branch`;
}

function displayWords(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.split(/(\s+|-)/).map((part) => {
    if (!part || /^(\s+|-)$/.test(part)) return part;
    if (/^(IT|GPT|CM|ERP|VPN|UI|UX|HR|WPCC)$/i.test(part)) return part.toUpperCase();
    if (/^[A-Z0-9]+$/.test(part)) return part.length <= 2 ? part : `${part.charAt(0)}${part.slice(1).toLowerCase()}`;
    if (/^[a-z]+$/.test(part)) return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    return part;
  }).join("");
}

function normalizeLabel(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function activityOpenText(calc) {
  const parts = [
    calc.inProgress ? `${calc.inProgress} ${verbRemains(calc.inProgress)} in progress` : "",
    calc.pending ? `${calc.pending} pending` : "",
    calc.onHold ? `${calc.onHold} on hold` : "",
    calc.cancelled ? `${calc.cancelled} cancelled` : "",
  ].filter(Boolean);
  return parts.join(", ");
}

function fmtPeso(n) {
  const num = Number(n) || 0;
  const value = "\u20b1" + Math.abs(num).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return num < 0 ? `(${value})` : value;
}
