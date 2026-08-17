import assert from "node:assert/strict";
import { buildExecutiveSummary, calcActivity, calcCustom, calcMarketing, calcSales } from "../src/lib/calc.js";
import { IT_SAMPLE, MARKETING_SAMPLE, SALES_SAMPLE } from "../src/lib/sampleData.js";

const closeTo = (actual, expected, tolerance = 0.001) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
};

const activity = calcActivity(IT_SAMPLE.data.rows);
assert.equal(activity.total, 12);
assert.equal(activity.completed, 7);
assert.equal(activity.inProgress, 5);
closeTo(activity.completionRate, 58.3333333333);
assert.equal(activity.priority.High, 11);
assert.equal(activity.priority.Medium, 1);
assert.deepEqual(activity.employeeContribution.map(({ name, count }) => [name, count]), [["Kenneth", 6], ["Rovel", 6]]);
assert.equal(activity.perDate.length, 6);
assert.ok(activity.perDate.every(({ count }) => count === 2));

const normalized = calcActivity([
  { employee: "A", activity: "One", status: " completed ", priority: " HIGH " },
  { employee: "B", activity: "Two", status: "IN PROGRESS", priority: "critical" },
]);
assert.equal(normalized.completed, 1);
assert.equal(normalized.inProgress, 1);
assert.equal(normalized.priority.High, 1);
assert.equal(normalized.priority.Critical, 1);

const sales = calcSales(SALES_SAMPLE.data.rows);
assert.equal(sales.totalTarget, 14_100_000);
assert.equal(sales.totalGross, 12_700_000);
assert.equal(sales.totalCM, 435_000);
assert.equal(sales.totalAdjustments, 145_000);
assert.equal(sales.totalNet, 12_120_000);
closeTo(sales.overallAchievement, 85.9574468085);
assert.ok(sales.rows.every((row) => row.netSales === row.grossSales - row.creditMemo - row.returns));
assert.equal(calcSales([{ salesperson: "No quota", quota: 0, grossSales: 100 }]).rows[0].achievement, 0);
assert.equal(calcSales([{ salesperson: "Negative", quota: 100, grossSales: 10, creditMemo: 20 }]).rows[0].netSales, -10);

const marketing = calcMarketing(MARKETING_SAMPLE.data.rows);
assert.equal(marketing.total, 7);
assert.equal(marketing.completed, 5);
assert.equal(marketing.inProgress, 2);
assert.equal(marketing.totalInquiries, 365);
assert.equal(marketing.totalLeads, 165);
assert.equal(marketing.totalOrders, 54);
assert.equal(marketing.totalSales, 590_000);

const custom = calcCustom([
  { id: "amount", name: "Amount", type: "Number", calc: "Average" },
  { id: "name", name: "Name", type: "Text", calc: "Count" },
], [
  { amount: 10, name: "A" },
  { amount: "", name: "" },
  { amount: 20, name: "B" },
]);
assert.equal(custom.rowCount, 2);
assert.equal(custom.results.amount, 15);
assert.equal(custom.results.name, 2);

const summary = buildExecutiveSummary(IT_SAMPLE, activity);
assert.match(summary, /12 activities/);
assert.match(summary, /7 activities were completed/);
assert.match(summary, /5 remain in progress/);
assert.match(summary, /58\.33%/);

const singleReport = {
  ...IT_SAMPLE,
  info: { ...IT_SAMPLE.info, startDate: "2026-08-10", endDate: "2026-08-15", branch: "CEBU", preparedBy: "KENNETH SAPIO" },
  data: { rows: [{ date: "2026-08-10", employee: "KENNETH SAPIO", activity: "Planning", status: "Completed", priority: "High" }] },
};
const singleCalc = calcActivity(singleReport.data.rows);
const singleSummary = buildExecutiveSummary(singleReport, singleCalc);
assert.match(singleSummary, /From August 10 to August 15, 2026/);
assert.match(singleSummary, /Cebu Branch/);
assert.match(singleSummary, /recorded 1 activity\./);
assert.doesNotMatch(singleSummary, /1 activities|1 tasks|1 contributors/);
assert.match(singleSummary, /The top contributor was Kenneth Sapio with 1 activity/);

console.log("Calculation verification passed: activity, sales, marketing, custom, and executive summaries.");
