import type { BillPriority, OccurrenceStatus, CurrencyCode, BillingCycle } from "@/lib/billing/types";

export type MockBill = {
  id: string;
  name: string;
  vendor: string;
  amountCents: number;
  currency: CurrencyCode;
  dueDate: string;
  cycle: BillingCycle;
  category: string;
  priority: BillPriority;
  status: OccurrenceStatus;
  tags: string[];
  notes: string;
  source: string | null;
  createdAt: string;
};

export type MockUpcomingItem = {
  id: string;
  billId: string;
  name: string;
  vendor: string;
  dueDate: string;
  amountCents: number;
  currency: CurrencyCode;
  status: OccurrenceStatus;
  priority: BillPriority;
  daysUntilDue: number;
};

export type MockCategoryTotal = {
  category: string;
  amountCents: number;
  count: number;
  color: string;
};

export type MockMonthlyBreakdown = {
  month: string;
  amountCents: number;
};

export const mockBills: MockBill[] = [
  {
    id: "bill-1",
    name: "AWS Cloud Infrastructure",
    vendor: "Amazon Web Services",
    amountCents: 12050,
    currency: "USD",
    dueDate: "2026-06-15",
    cycle: "monthly",
    category: "Cloud",
    priority: "medium",
    status: "unpaid",
    tags: ["cloud", "infrastructure"],
    notes: "EC2 instances + S3 storage for production. Usually $110-130/mo.",
    source: null,
    createdAt: "2026-01-10T08:00:00Z"
  },
  {
    id: "bill-2",
    name: "Office Rent",
    vendor: "Waterfront Properties",
    amountCents: 280000,
    currency: "USD",
    dueDate: "2026-06-01",
    cycle: "monthly",
    category: "Rent",
    priority: "critical",
    status: "unpaid",
    tags: ["office", "facilities"],
    notes: "Suite 400. Due by 1st of each month, 5-day grace period.",
    source: null,
    createdAt: "2026-01-01T08:00:00Z"
  },
  {
    id: "bill-3",
    name: "Google Workspace",
    vendor: "Google",
    amountCents: 7200,
    currency: "USD",
    dueDate: "2026-05-28",
    cycle: "monthly",
    category: "SaaS",
    priority: "medium",
    status: "overdue",
    tags: ["email", "productivity"],
    notes: "Business Standard plan for 6 users.",
    source: null,
    createdAt: "2026-02-15T08:00:00Z"
  },
  {
    id: "bill-4",
    name: "Adobe Creative Cloud",
    vendor: "Adobe Inc.",
    amountCents: 5999,
    currency: "USD",
    dueDate: "2026-04-15",
    cycle: "monthly",
    category: "SaaS",
    priority: "low",
    status: "paid",
    tags: ["design"],
    notes: "Single-user plan for design team.",
    source: "csv",
    createdAt: "2026-01-05T08:00:00Z"
  },
  {
    id: "bill-5",
    name: "Business Insurance",
    vendor: "StateFarm Commercial",
    amountCents: 45000,
    currency: "USD",
    dueDate: "2026-07-01",
    cycle: "yearly",
    category: "Insurance",
    priority: "high",
    status: "unpaid",
    tags: ["insurance", "compliance"],
    notes: "Annual commercial liability policy. Renewal due July 2026.",
    source: null,
    createdAt: "2025-07-01T08:00:00Z"
  },
  {
    id: "bill-6",
    name: "Electricity",
    vendor: "Pacific Gas & Electric",
    amountCents: 18500,
    currency: "USD",
    dueDate: "2026-06-10",
    cycle: "monthly",
    category: "Utilities",
    priority: "medium",
    status: "unpaid",
    tags: ["utilities", "office"],
    notes: "Varies seasonally. Summer months typically higher.",
    source: "csv",
    createdAt: "2026-01-10T08:00:00Z"
  },
  {
    id: "bill-7",
    name: "Internet Service",
    vendor: "Comcast Business",
    amountCents: 12999,
    currency: "USD",
    dueDate: "2026-06-05",
    cycle: "monthly",
    category: "Utilities",
    priority: "medium",
    status: "unpaid",
    tags: ["internet", "utilities"],
    notes: "Business 500Mbps plan with static IP.",
    source: null,
    createdAt: "2026-01-05T08:00:00Z"
  },
  {
    id: "bill-8",
    name: "Domain Renewals",
    vendor: "Namecheap",
    amountCents: 8500,
    currency: "USD",
    dueDate: "2026-08-20",
    cycle: "yearly",
    category: "SaaS",
    priority: "low",
    status: "unpaid",
    tags: ["domains", "infrastructure"],
    notes: "Renewal for 5 domains: billflow.io, seehy.co, and 3 others.",
    source: null,
    createdAt: "2026-01-20T08:00:00Z"
  },
  {
    id: "bill-9",
    name: "GitHub Enterprise",
    vendor: "GitHub Inc.",
    amountCents: 10500,
    currency: "USD",
    dueDate: "2026-06-12",
    cycle: "monthly",
    category: "SaaS",
    priority: "high",
    status: "unpaid",
    tags: ["dev", "infrastructure"],
    notes: "Enterprise plan for engineering team. 8 seats.",
    source: null,
    createdAt: "2026-02-01T08:00:00Z"
  },
  {
    id: "bill-10",
    name: "Accounting Software",
    vendor: "QuickBooks",
    amountCents: 4500,
    currency: "USD",
    dueDate: "2026-05-15",
    cycle: "monthly",
    category: "SaaS",
    priority: "low",
    status: "paid",
    tags: ["accounting", "finance"],
    notes: "Simple Start plan. May upgrade to Essentials next quarter.",
    source: "csv",
    createdAt: "2026-01-01T08:00:00Z"
  },
  {
    id: "bill-11",
    name: "Server Hosting",
    vendor: "DigitalOcean",
    amountCents: 9600,
    currency: "USD",
    dueDate: "2026-06-20",
    cycle: "monthly",
    category: "Cloud",
    priority: "medium",
    status: "unpaid",
    tags: ["cloud", "hosting"],
    notes: "2 Droplets + managed database. Considering upgrade to reserved instances.",
    source: null,
    createdAt: "2026-03-01T08:00:00Z"
  },
  {
    id: "bill-12",
    name: "Cleaning Service",
    vendor: "Spotless Office",
    amountCents: 32000,
    currency: "USD",
    dueDate: "2026-06-03",
    cycle: "monthly",
    category: "Facilities",
    priority: "medium",
    status: "unpaid",
    tags: ["office", "facilities"],
    notes: "Weekly cleaning service. Invoiced monthly.",
    source: null,
    createdAt: "2026-01-15T08:00:00Z"
  }
];

export const mockUpcomingItems: MockUpcomingItem[] = [
  { id: "occ-1", billId: "bill-2", name: "Office Rent", vendor: "Waterfront Properties", dueDate: "2026-06-01", amountCents: 280000, currency: "USD", status: "unpaid", priority: "critical", daysUntilDue: 3 },
  { id: "occ-2", billId: "bill-12", name: "Cleaning Service", vendor: "Spotless Office", dueDate: "2026-06-03", amountCents: 32000, currency: "USD", status: "unpaid", priority: "medium", daysUntilDue: 5 },
  { id: "occ-3", billId: "bill-7", name: "Internet Service", vendor: "Comcast Business", dueDate: "2026-06-05", amountCents: 12999, currency: "USD", status: "unpaid", priority: "medium", daysUntilDue: 7 },
  { id: "occ-4", billId: "bill-6", name: "Electricity", vendor: "Pacific Gas & Electric", dueDate: "2026-06-10", amountCents: 18500, currency: "USD", status: "unpaid", priority: "medium", daysUntilDue: 12 },
  { id: "occ-5", billId: "bill-9", name: "GitHub Enterprise", vendor: "GitHub Inc.", dueDate: "2026-06-12", amountCents: 10500, currency: "USD", status: "unpaid", priority: "high", daysUntilDue: 14 },
  { id: "occ-6", billId: "bill-1", name: "AWS Cloud Infrastructure", vendor: "Amazon Web Services", dueDate: "2026-06-15", amountCents: 12050, currency: "USD", status: "unpaid", priority: "medium", daysUntilDue: 17 },
  { id: "occ-7", billId: "bill-11", name: "Server Hosting", vendor: "DigitalOcean", dueDate: "2026-06-20", amountCents: 9600, currency: "USD", status: "unpaid", priority: "medium", daysUntilDue: 22 }
];

export const mockCategoryTotals: MockCategoryTotal[] = [
  { category: "Rent", amountCents: 280000, count: 1, color: "#0d6b5c" },
  { category: "SaaS", amountCents: 46699, count: 5, color: "#2563eb" },
  { category: "Cloud", amountCents: 21650, count: 2, color: "#d97706" },
  { category: "Utilities", amountCents: 31499, count: 2, color: "#dc2626" },
  { category: "Insurance", amountCents: 45000, count: 1, color: "#7c3aed" },
  { category: "Facilities", amountCents: 32000, count: 1, color: "#059669" }
];

export const mockMonthlyBreakdown: MockMonthlyBreakdown[] = [
  { month: "2026-01", amountCents: 423000 },
  { month: "2026-02", amountCents: 398000 },
  { month: "2026-03", amountCents: 412000 },
  { month: "2026-04", amountCents: 385000 },
  { month: "2026-05", amountCents: 407000 },
  { month: "2026-06", amountCents: 456749 },
  { month: "2026-07", amountCents: 423000 }
];

export const mockExchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  ILS: 3.65
};

export const mockDashboardSummary = {
  monthlyObligationsCents: 456749,
  yearlyProjectionCents: 5480988,
  pendingCount: 8,
  pendingAmountCents: 456749,
  overdueCount: 1,
  overdueAmountCents: 7200,
  paidThisMonthCount: 2,
  paidThisMonthAmountCents: 10499
};

export const mockUserProfile = {
  name: "Alex Morgan",
  email: "alex@seehylabs.com",
  plan: "free" as const,
  defaultCurrency: "USD" as CurrencyCode,
  emailRemindersEnabled: true,
  pushRemindersEnabled: false
};

export const mockPricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For individuals getting started with bill tracking.",
    features: [
      "Up to 25 bills",
      "Basic dashboard & charts",
      "CSV export",
      "Demo currency converter",
      "Simple calculator",
      "Email reminders"
    ],
    cta: "Get started free",
    popular: false
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For freelancers and small businesses who need more power.",
    features: [
      "Unlimited bills",
      "Live currency conversion",
      "AI-powered bill fill",
      "CSV import & export",
      "Advanced calculator",
      "Push notifications",
      "Priority support"
    ],
    cta: "Start Pro trial",
    popular: true
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    description: "For teams that need shared bill management and controls.",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Role-based access",
      "Audit log",
      "Connected sources (Gmail, Sheets)",
      "API access",
      "Dedicated support"
    ],
    cta: "Contact sales",
    popular: false,
    comingSoon: true
  }
];

export const mockIntakeSources = [
  { id: "gmail", name: "Gmail", description: "Auto-detect bills from incoming emails", icon: "Gmail", connected: false, billsFound: 0 },
  { id: "sheets", name: "Google Sheets", description: "Sync bills from a shared spreadsheet", icon: "Sheets", connected: false, billsFound: 0 },
  { id: "csv", name: "CSV / Excel", description: "Import bills from CSV or Excel files", icon: "CSV", connected: false, billsFound: 0 },
  { id: "pdf", name: "PDF Upload", description: "Upload and scan PDF invoices", icon: "PDF", connected: false, billsFound: 0 },
  { id: "invoicing", name: "Invoicing Systems", description: "Connect QuickBooks, Xero, FreshBooks", icon: "Invoicing", connected: false, billsFound: 0, comingSoon: true }
];

export const mockDetectedBills = [
  { id: "det-1", source: "Gmail", vendor: "Slack Technologies", amountCents: 8750, currency: "USD", dueDate: "2026-06-14", invoiceNumber: "INV-2026-0523", confidence: 0.94, duplicateWarning: false },
  { id: "det-2", source: "Gmail", vendor: "Notion Labs", amountCents: 10000, currency: "USD", dueDate: "2026-06-08", invoiceNumber: "INV-NT-4412", confidence: 0.87, duplicateWarning: false },
  { id: "det-3", source: "CSV", vendor: "AWS Cloud Infrastructure", amountCents: 12050, currency: "USD", dueDate: "2026-06-15", invoiceNumber: "", confidence: 0.72, duplicateWarning: true }
];

export const mockActivityFeed = [
  { id: "act-1", action: "paid", billName: "Adobe Creative Cloud", amountCents: 5999, currency: "USD", date: "2026-05-28" },
  { id: "act-2", action: "added", billName: "Server Hosting", amountCents: 9600, currency: "USD", date: "2026-05-25" },
  { id: "act-3", action: "paid", billName: "Accounting Software", amountCents: 4500, currency: "USD", date: "2026-05-22" },
  { id: "act-4", action: "overdue", billName: "Google Workspace", amountCents: 7200, currency: "USD", date: "2026-05-28" },
  { id: "act-5", action: "imported", billName: "3 bills from CSV", amountCents: 0, currency: "USD", date: "2026-05-20" }
];

export const mockFeaturedFeatures = [
  { title: "Bill Tracking", description: "Track every recurring and one-time bill in a single organized view. Never miss a due date again.", icon: "FileText" },
  { title: "Smart Insights", description: "AI-powered spending analysis that surfaces trends, anomalies, and savings opportunities.", icon: "Lightbulb" },
  { title: "Currency Conversion", description: "Convert between USD, EUR, GBP, and ILS with live exchange rates. Every bill in your preferred currency.", icon: "DollarSign" },
  { title: "Financial Calculator", description: "Monthly projections, yearly totals, percentage changes, and subscription cost analysis.", icon: "Calculator" },
  { title: "Import & Export", description: "Bring in bills from CSV, Excel, and Google Sheets. Export filtered reports in seconds.", icon: "Upload" },
  { title: "Omnichannel Intake", description: "Bills can come from Gmail, spreadsheets, PDFs, or invoicing platforms. One unified inbox.", icon: "Inbox" }
];
