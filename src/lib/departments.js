// Department configuration — defines data schema per department.
import {
  Monitor, TrendingUp, Megaphone, Users, Settings, Boxes, Wrench, Plus,
} from "lucide-react";

export const DEPARTMENTS = [
  { id: "Information Technology", name: "Information Technology", icon: Monitor, desc: "IT operations, monitoring & support", reportType: "activity", color: "#1e3a5f" },
  { id: "Sales", name: "Sales", icon: TrendingUp, desc: "Sales targets & achievement tracking", reportType: "sales", color: "#b91c1c" },
  { id: "Marketing / Online Sales", name: "Marketing / Online Sales", icon: Megaphone, desc: "Campaigns, leads & online orders", reportType: "marketing", color: "#16a34a" },
  { id: "Human Resources", name: "Human Resources", icon: Users, desc: "HR activities & workforce tasks", reportType: "activity", color: "#7c3aed" },
  { id: "Operations", name: "Operations", icon: Settings, desc: "Operational tasks & processes", reportType: "activity", color: "#f97316" },
  { id: "Inventory", name: "Inventory", icon: Boxes, desc: "Stock & inventory management", reportType: "activity", color: "#0891b2" },
  { id: "Technical", name: "Technical Department", icon: Wrench, desc: "Technical service & repairs", reportType: "activity", color: "#475569" },
  { id: "Custom Report", name: "Custom Report", icon: Plus, desc: "Build your own columns & fields", reportType: "custom", color: "#0f172a" },
];

export const ACTIVITY_FIELDS = [
  { key: "date", label: "Date", type: "date", width: "120px" },
  { key: "employee", label: "Employee Name", type: "text", width: "140px" },
  { key: "duty", label: "Duty / Monitoring Area", type: "text", width: "160px" },
  { key: "activity", label: "Activity / Task", type: "text", width: "180px" },
  { key: "description", label: "Description", type: "text", width: "240px" },
  { key: "status", label: "Status", type: "select", options: ["Completed", "In Progress", "Pending", "On Hold", "Cancelled"], width: "140px" },
  { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"], width: "110px" },
  { key: "remarks", label: "Remarks", type: "text", width: "180px" },
];

const ACTIVITY_LABELS = {
  "Human Resources": { employee: "Employee / Candidate", duty: "HR Function", activity: "Activity / Case" },
  Operations: { employee: "Responsible Person", duty: "Process / Area", activity: "Operational Task" },
  Inventory: { employee: "Custodian", duty: "Warehouse / Category", activity: "Inventory Activity" },
  Technical: { employee: "Technician", duty: "Equipment / Service Area", activity: "Technical Task / Repair" },
};

export function getActivityFields(department) {
  const labels = ACTIVITY_LABELS[department] || {};
  return ACTIVITY_FIELDS.map((field) => ({ ...field, label: labels[field.key] || field.label }));
}

export function emptyActivityRow() {
  return {
    date: new Date().toISOString().slice(0, 10),
    employee: "", duty: "", activity: "", description: "",
    status: "In Progress", priority: "Medium", remarks: "",
  };
}

export const SALES_FIELDS = [
  { key: "salesperson", label: "Salesperson", type: "text", width: "160px" },
  { key: "quota", label: "Individual Quota / Target", type: "currency", width: "160px" },
  { key: "grossSales", label: "Gross Sales", type: "currency", width: "150px" },
  { key: "creditMemo", label: "Credit Memo / CM", type: "currency", width: "140px" },
  { key: "returns", label: "Returns / Adjustments", type: "currency", width: "150px" },
  { key: "remarks", label: "Remarks", type: "text", width: "200px" },
];

export function emptySalesRow() {
  return { salesperson: "", quota: 0, grossSales: 0, creditMemo: 0, returns: 0, remarks: "" };
}

export const MARKETING_FIELDS = [
  { key: "date", label: "Date", type: "date", width: "120px" },
  { key: "activity", label: "Main Activity", type: "text", width: "180px" },
  { key: "platform", label: "Platform", type: "select", options: ["Facebook", "Facebook Marketplace", "Messenger", "TikTok", "Instagram", "Website", "GPT", "CapCut", "Other"], width: "150px" },
  { key: "product", label: "Product", type: "text", width: "150px" },
  { key: "campaignType", label: "Campaign Type", type: "select", options: ["Product Promotion", "Engagement Campaign", "Reseller Promotion", "Boosting Setup", "Organic Posting", "Marketplace Posting", "Customer Follow-Up", "Video Promotion", "Other"], width: "170px" },
  { key: "inquiries", label: "Inquiries", type: "number", width: "100px" },
  { key: "leads", label: "Leads", type: "number", width: "90px" },
  { key: "orders", label: "Orders", type: "number", width: "90px" },
  { key: "salesAmount", label: "Sales Amount", type: "currency", width: "130px" },
  { key: "status", label: "Status", type: "select", options: ["Completed", "In Progress", "Pending", "On Hold", "Cancelled"], width: "130px" },
  { key: "followUp", label: "Follow-Up", type: "select", options: ["Completed", "In Progress", "Pending", "N/A"], width: "120px" },
  { key: "remarks", label: "Remarks", type: "text", width: "160px" },
];

export function emptyMarketingRow() {
  return {
    date: new Date().toISOString().slice(0, 10),
    activity: "", platform: "Facebook", product: "", campaignType: "Product Promotion",
    inquiries: 0, leads: 0, orders: 0, salesAmount: 0, status: "In Progress", followUp: "Pending", remarks: "",
  };
}

export const COLUMN_TYPES = ["Text", "Number", "Currency", "Percentage", "Date", "Status", "Dropdown", "Checkbox"];
export const CALC_TYPES = ["None", "Sum", "Average", "Count", "Minimum", "Maximum", "Percentage"];

export function getDepartmentConfig(deptId) {
  return DEPARTMENTS.find((d) => d.id === deptId);
}
