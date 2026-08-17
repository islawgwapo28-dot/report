// Sample data for development/testing of WPCC reports.

export const IT_SAMPLE = {
  info: {
    companyName: "WELD POWERTOOLS & CONSTRUCTION CORPORATION",
    companyLogo: "",
    department: "Information Technology",
    branch: "Head Office - Cebu",
    preparedBy: "Kenneth Mendoza",
    reportTitle: "IT Weekly Performance Report",
    startDate: "2026-08-10",
    endDate: "2026-08-15",
    reportType: "Weekly",
  },
  department: "Information Technology",
  data: {
    rows: [
      { date: "2026-08-10", employee: "Kenneth", duty: "Server Monitoring", activity: "Server Health Check", description: "Routine monitoring of all production servers", status: "Completed", priority: "High", remarks: "All systems normal" },
      { date: "2026-08-10", employee: "Rovel", duty: "Network Security", activity: "Firewall Update", description: "Updated firewall rules and policies", status: "Completed", priority: "High", remarks: "Patched vulnerability" },
      { date: "2026-08-11", employee: "Kenneth", duty: "Helpdesk Support", activity: "Ticket Resolution", description: "Resolved 15 user support tickets", status: "Completed", priority: "High", remarks: "" },
      { date: "2026-08-11", employee: "Rovel", duty: "System Backup", activity: "Database Backup", description: "Full backup of company databases", status: "Completed", priority: "High", remarks: "Backup verified" },
      { date: "2026-08-12", employee: "Kenneth", duty: "Software Deployment", activity: "ERP Update", description: "Deployed ERP system patch v2.4", status: "In Progress", priority: "High", remarks: "Testing phase" },
      { date: "2026-08-12", employee: "Rovel", duty: "Network Monitoring", activity: "Bandwidth Audit", description: "Audited network bandwidth usage", status: "Completed", priority: "High", remarks: "" },
      { date: "2026-08-13", employee: "Kenneth", duty: "Cybersecurity", activity: "Security Scan", description: "Ran malware scan on all workstations", status: "Completed", priority: "High", remarks: "No threats found" },
      { date: "2026-08-13", employee: "Rovel", duty: "Hardware Maintenance", activity: "Printer Setup", description: "Configured 3 new network printers", status: "In Progress", priority: "High", remarks: "Awaiting user acceptance" },
      { date: "2026-08-14", employee: "Kenneth", duty: "Email System", activity: "Mail Server Config", description: "Configured email routing rules", status: "In Progress", priority: "High", remarks: "" },
      { date: "2026-08-14", employee: "Rovel", duty: "Data Recovery", activity: "Recovery Test", description: "Tested disaster recovery procedure", status: "Completed", priority: "High", remarks: "RTO within SLA" },
      { date: "2026-08-15", employee: "Kenneth", duty: "VPN Setup", activity: "Remote Access Config", description: "Set up VPN for new remote staff", status: "In Progress", priority: "High", remarks: "Awaiting approval" },
      { date: "2026-08-15", employee: "Rovel", duty: "Asset Inventory", activity: "IT Asset Audit", description: "Conducted quarterly IT asset audit", status: "In Progress", priority: "Medium", remarks: "" },
    ],
  },
};

export const SALES_SAMPLE = {
  info: {
    companyName: "WELD POWERTOOLS & CONSTRUCTION CORPORATION",
    companyLogo: "",
    department: "Sales",
    branch: "Cebu Branch",
    preparedBy: "Sales Manager",
    reportTitle: "Cebu Branch Sales Performance Report",
    startDate: "2026-08-10",
    endDate: "2026-08-15",
    reportType: "Weekly",
  },
  department: "Sales",
  data: {
    rows: [
      { salesperson: "Juan Dela Cruz", quota: 3000000, grossSales: 3200000, creditMemo: 150000, returns: 50000, remarks: "Strong week" },
      { salesperson: "Maria Santos", quota: 2500000, grossSales: 2300000, creditMemo: 80000, returns: 20000, remarks: "" },
      { salesperson: "Pedro Reyes", quota: 2800000, grossSales: 1850000, creditMemo: 60000, returns: 35000, remarks: "Below target" },
      { salesperson: "Ana Lim", quota: 3200000, grossSales: 3400000, creditMemo: 100000, returns: 25000, remarks: "Top performer" },
      { salesperson: "Carlos Tan", quota: 2600000, grossSales: 1950000, creditMemo: 45000, returns: 15000, remarks: "" },
    ],
  },
};

export const MARKETING_SAMPLE = {
  info: {
    companyName: "WELD POWERTOOLS & CONSTRUCTION CORPORATION",
    companyLogo: "",
    department: "Marketing / Online Sales",
    branch: "Online Sales Division",
    preparedBy: "Marketing Team",
    reportTitle: "Marketing & Online Sales Weekly Report",
    startDate: "2026-08-10",
    endDate: "2026-08-15",
    reportType: "Weekly",
  },
  department: "Marketing / Online Sales",
  data: {
    rows: [
      { date: "2026-08-10", activity: "Brochure Creation", platform: "Website", product: "Power Tools Catalog", campaignType: "Product Promotion", inquiries: 25, leads: 12, orders: 5, salesAmount: 45000, status: "Completed", followUp: "Completed", remarks: "" },
      { date: "2026-08-10", activity: "Product Posting", platform: "Facebook Marketplace", product: "Cordless Drill", campaignType: "Marketplace Posting", inquiries: 40, leads: 18, orders: 8, salesAmount: 78000, status: "Completed", followUp: "Completed", remarks: "" },
      { date: "2026-08-11", activity: "Facebook Boosting", platform: "Facebook", product: "Angle Grinder", campaignType: "Boosting Setup", inquiries: 65, leads: 30, orders: 12, salesAmount: 120000, status: "Completed", followUp: "In Progress", remarks: "High engagement" },
      { date: "2026-08-12", activity: "Customer Follow-Up", platform: "Messenger", product: "Various", campaignType: "Customer Follow-Up", inquiries: 30, leads: 15, orders: 6, salesAmount: 55000, status: "Completed", followUp: "Completed", remarks: "" },
      { date: "2026-08-13", activity: "Guess the Product Campaign", platform: "Facebook", product: "Tool Kit Set", campaignType: "Engagement Campaign", inquiries: 85, leads: 40, orders: 4, salesAmount: 32000, status: "In Progress", followUp: "Pending", remarks: "Viral post" },
      { date: "2026-08-14", activity: "Reseller Promotion", platform: "Facebook", product: "Bulk Tools", campaignType: "Reseller Promotion", inquiries: 50, leads: 22, orders: 10, salesAmount: 165000, status: "Completed", followUp: "In Progress", remarks: "" },
      { date: "2026-08-15", activity: "Video Promotional Products", platform: "TikTok", product: "Welding Machine", campaignType: "Video Promotion", inquiries: 70, leads: 28, orders: 9, salesAmount: 95000, status: "In Progress", followUp: "Pending", remarks: "Trending" },
    ],
  },
};

export const SAMPLES = {
  "Information Technology": IT_SAMPLE,
  Sales: SALES_SAMPLE,
  "Marketing / Online Sales": MARKETING_SAMPLE,
};
