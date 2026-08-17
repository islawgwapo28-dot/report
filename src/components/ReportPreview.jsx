import OnePageReport from "./OnePageReport";
import { calcActivity, calcCustom, calcMarketing, calcSales } from "@/lib/calc";
import { resolveTheme } from "@/lib/templates";

// Shared wide landscape renderer. Design tokens never mutate report data;
// the 1672 x 941 presentation canvas is scaled only at export time.
export default function ReportPreview({ report, forwardRef = null }) {
  const theme = resolveTheme(report.design?.templateId || "darkblue", report.design?.customColors || null);
  return <OnePageReport report={report} calc={computeCalc(report)} theme={theme} forwardRef={forwardRef} />;
}

function computeCalc(report) {
  if (report.department === "Sales") return calcSales(report.data?.rows || []);
  if (report.department === "Marketing / Online Sales") return calcMarketing(report.data?.rows || []);
  if (report.department === "Custom Report") return calcCustom(report.customConfig?.columns, report.customConfig?.rows);
  return calcActivity(report.data?.rows || []);
}
