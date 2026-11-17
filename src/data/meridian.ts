/**
 * Meridian Technologies — fictional, illustrative demo data.
 * Nothing here describes a real company, real people or real AI output.
 * Values are deterministic so the demo behaves identically on every run.
 */
import type {
  Company,
  Finding,
  Kpi,
  KeyMetric,
  Observation,
  RiskScore,
  SourceDocument,
  YearFinancials,
} from "@/types/domain"

export const ANALYST = { name: "Layla Haddad", role: "Senior Associate", initials: "LH" }

export const COMPANY: Company = {
  name: "Meridian Technologies",
  country: "UAE",
  city: "Dubai",
  industry: "Enterprise software & IT services",
  period: "FY2022 – FY2024",
  description:
    "Founded 2011 · ~640 employees · Cloud ERP, cybersecurity and managed services for GCC government and banking clients.",
  tags: ["Buy-out · 100% stake", "Seller: founders + Gulf Ventures II", "Exclusivity ends 12 Dec 2026"],
}

export const OTHER_COMPANIES = [
  { name: "Qamar Logistics", country: "KSA" },
  { name: "Noor Health Systems", country: "Qatar" },
]

export const RECOMMENDATION = {
  verdict: "Proceed with conditions",
  confidence: "Moderate",
  rationale:
    "Strong growth and cash generation. Proceed to confirmatory diligence, conditional on PDPL remediation before close and customer-concentration protections in the SPA.",
}

export const LAST_UPDATED = "17 Nov 2026, 09:42 GST"

export const KPIS: Kpi[] = [
  { id: "revenue", label: "Annual revenue", value: 74.8, format: "currency-m", delta: "+21.6% vs FY23", trend: "positive", footnote: "FY2024 · Audited financial statements" },
  { id: "growth", label: "Revenue growth", value: 21.6, format: "percent", delta: "−6.0 pts vs FY23 (27.6%)", trend: "negative", footnote: "Year on year · FY2024" },
  { id: "margin", label: "EBITDA margin", value: 18.0, format: "percent", delta: "−2.0 pts vs FY23", trend: "negative", footnote: "EBITDA $13.5m · FY2024" },
  { id: "ev", label: "Enterprise valuation", value: 325, format: "currency-m", delta: "24.1× EBITDA · 4.3× revenue", trend: "neutral", footnote: "Indicative · Seller asking price" },
]

export const FINANCIALS: YearFinancials[] = [
  { year: "FY2022", revenue: 48.2, ebitda: 8.7, margin: 18.0 },
  { year: "FY2023", revenue: 61.5, ebitda: 12.3, margin: 20.0 },
  { year: "FY2024", revenue: 74.8, ebitda: 13.5, margin: 18.0 },
]

export const KEY_METRICS: KeyMetric[] = [
  { label: "Revenue CAGR FY22–24", value: "24.6%" },
  { label: "Gross margin", value: "61.2%", note: "+1.4 pts" },
  { label: "Recurring revenue", value: "63%", note: "+5 pts" },
  { label: "Net revenue retention", value: "118%", note: "Top 20" },
  { label: "Net cash", value: "$18.4m" },
  { label: "Days sales outstanding", value: "94 days", note: "↑ from 71", attention: true },
]

export const RISKS: RiskScore[] = [
  { category: "regulatory", severity: "high", score: 72, summary: "PDPL data-protection gap; offshore hosting of government data" },
  { category: "financial", severity: "medium", score: 58, summary: "Customer concentration; FY24 margin compression" },
  { category: "market", severity: "medium", score: 48, summary: "Government renewal cluster; hyperscaler competition" },
  { category: "operational", severity: "medium", score: 41, summary: "Key-person dependency on CTO and two architects" },
]
export const OVERALL_RISK = { label: "Elevated", score: 56 }

export const SUMMARY = {
  generatedAt: "17 Nov 2026, 09:40",
  text: "Meridian is a profitable, fast-growing GCC enterprise-software provider with improving revenue quality. Growth is decelerating and FY24 margin compressed by 2.0 pts. At 24.1× EBITDA the case is attractive only if the PDPL compliance gap is remediated before close and customer concentration is protected contractually.",
  sources: [
    { label: "AFS FY24 p.6" },
    { label: "Mgmt accounts Q4 p.3" },
    { label: "F-01 · Legal DD p.12", findingId: "F-01" },
    { label: "F-02 · AFS FY24 p.34", findingId: "F-02" },
  ],
}

export const POSITIVES: Observation[] = [
  { text: "Revenue CAGR of 24.6% FY22–24, ahead of GCC IT-services peers (~11%)", cite: "AFS FY24 p.6" },
  { text: "Recurring revenue rose to 63% of total (FY22: 52%)", cite: "Mgmt accounts Q4 p.3" },
  { text: "Net revenue retention of 118% across the top 20 accounts", cite: "Cohort analysis p.9" },
]

export const CONCERNS: Observation[] = [
  { text: "No DPO or processing register under UAE PDPL; government data hosted offshore", cite: "F-01 · Legal DD p.12", findingId: "F-01" },
  { text: "Top-3 customers represent 41% of FY24 revenue", cite: "F-02 · AFS FY24 p.34", findingId: "F-02" },
  { text: "38% of government contract value renews in Q2 FY25", cite: "F-03 · Contracts p.21", findingId: "F-03" },
]

export const DOCUMENTS: SourceDocument[] = [
  { id: "afs", title: "Audited Financial Statements FY2024", shortTitle: "AFS FY24", pages: 52, kind: "pdf", uploadedAt: "12 Nov 2026" },
  { id: "legal", title: "Legal Due Diligence Report (draft)", shortTitle: "Legal DD", pages: 38, kind: "pdf", uploadedAt: "14 Nov 2026" },
  { id: "contracts", title: "Contract Register — Government", shortTitle: "Contracts", pages: 24, kind: "xlsx", uploadedAt: "14 Nov 2026" },
  { id: "mgmt", title: "Management Accounts Q4 FY2024", shortTitle: "Mgmt accounts", pages: 16, kind: "xlsx", uploadedAt: "15 Nov 2026" },
  { id: "hr", title: "HR & Organisation Review", shortTitle: "HR review", pages: 11, kind: "pdf", uploadedAt: "15 Nov 2026" },
  { id: "hosting", title: "Hosting Services Agreement — CloudCore GmbH", shortTitle: "Hosting agmt", pages: 18, kind: "pdf", uploadedAt: "16 Nov 2026" },
]
/** Displayed count includes supporting files not individually modelled. */
export const DATA_ROOM_TOTAL = 14

const AI_FLAGGED = (at = "17 Nov · 09:40") => ({ at, text: "Raised by AI analysis (demo) · confidence Moderate" })

export const FINDINGS: Finding[] = [
  {
    id: "F-01",
    title: "Data-protection compliance gap under UAE PDPL",
    severity: "critical",
    category: "regulatory",
    explanation: "No Data Protection Officer or records-of-processing register; government-client data hosted outside the UAE.",
    aiRationale:
      "No Data Protection Officer or records-of-processing register exists, and government-client data is hosted in Frankfurt — conflicting with data-residency clauses in 3 government contracts. Exposure: regulatory fines and client termination rights.",
    evidence: [
      { id: "E-01a", documentId: "legal", page: 12, excerpt: "The Company has not appointed a Data Protection Officer nor maintained a record of processing activities as required under Federal Decree-Law No. 45 of 2021.", strength: "strong", score: 92, rationale: "Corroborated by IT policy register p.3" },
      { id: "E-01b", documentId: "hosting", page: 4, excerpt: "Primary and secondary data centres: Frankfurt am Main, Germany. The Customer may not designate alternative hosting regions.", strength: "moderate", score: 74, rationale: "Single source; residency clauses not yet reviewed" },
    ],
    status: "needs-review",
    history: [AI_FLAGGED()],
  },
  {
    id: "F-02",
    title: "Top-3 customers represent 41% of FY24 revenue",
    severity: "high",
    category: "financial",
    explanation: "Three government and banking clients contributed $30.7m; loss of any one would remove 11–16% of revenue.",
    aiRationale:
      "Note 21 of the audited accounts discloses revenue from the three largest customers of $30.7m (41%), up from 36% in FY23. Concentration is rising while two of the three contracts include change-of-control termination rights.",
    evidence: [
      { id: "E-02a", documentId: "afs", page: 34, excerpt: "Revenue from the Group's three largest customers amounted to USD 30.7m (FY2023: USD 22.1m), representing 41% of total revenue.", strength: "strong", score: 95, rationale: "Matches management accounts p.11" },
      { id: "E-02b", documentId: "contracts", page: 7, excerpt: "Either party may terminate on 90 days' notice following a change of control of the Supplier.", strength: "moderate", score: 71, rationale: "Clause present in 2 of 3 top contracts" },
    ],
    status: "needs-review",
    history: [AI_FLAGGED()],
  },
  {
    id: "F-03",
    title: "Government contract renewals concentrated in Q2 FY25",
    severity: "high",
    category: "market",
    explanation: "38% of government contract value is up for renewal within a single quarter after expected close.",
    aiRationale:
      "The contract register shows 11 government contracts worth $17.9m ARR with renewal dates between April and June 2025. A procurement delay in that window would hit the first post-close year.",
    evidence: [
      { id: "E-03a", documentId: "contracts", page: 21, excerpt: "Renewal schedule: 11 agreements (ARR USD 17.9m) fall due between 01-Apr-2025 and 30-Jun-2025.", strength: "strong", score: 88, rationale: "Structured register data" },
    ],
    status: "flagged",
    history: [AI_FLAGGED(), { at: "17 Nov · 10:05", text: "Flagged by Layla Haddad — request renewal pipeline from management" }],
  },
  {
    id: "F-04",
    title: "EBITDA margin contracted 2.0 pts in FY24",
    severity: "medium",
    category: "financial",
    explanation: "Margin fell from 20.0% to 18.0% as delivery headcount grew faster than revenue.",
    aiRationale:
      "Management accounts show delivery staff costs up 34% against revenue growth of 21.6%. Management attributes this to a one-off ramp for a Ministry programme.",
    evidence: [
      { id: "E-04a", documentId: "mgmt", page: 8, excerpt: "Adjusted EBITDA USD 13.5m (18.0%) vs USD 12.3m (20.0%); delivery personnel costs +34% YoY.", strength: "strong", score: 90, rationale: "Reconciles to audited EBITDA" },
    ],
    status: "accepted",
    history: [AI_FLAGGED(), { at: "17 Nov · 10:11", text: "Accepted by Layla Haddad" }],
  },
  {
    id: "F-05",
    title: "Key-person dependency on CTO and two architects",
    severity: "medium",
    category: "operational",
    explanation: "Core platform knowledge sits with three individuals without retention agreements.",
    aiRationale:
      "The HR review lists the CTO and two principal architects as sole owners of the ERP platform roadmap and code review. None hold retention or non-compete agreements.",
    evidence: [
      { id: "E-05a", documentId: "hr", page: 5, excerpt: "No formal succession plan exists for the CTO; platform architecture decisions are concentrated in three individuals.", strength: "moderate", score: 68, rationale: "Interview-based; not yet verified" },
    ],
    status: "needs-review",
    history: [AI_FLAGGED()],
  },
  {
    id: "F-06",
    title: "Revenue-recognition policy change for multi-year licences",
    severity: "low",
    category: "financial",
    explanation: "Shift from upfront to ratable recognition for licences over 24 months.",
    aiRationale:
      "Accounting policy note 3.4 records a change in timing for multi-year licence revenue. Impact on FY24 revenue is disclosed as immaterial (<0.5%).",
    evidence: [
      { id: "E-06a", documentId: "afs", page: 47, excerpt: "From 1 January 2024 licences with terms exceeding 24 months are recognised rateably. The effect on the current year is not material.", strength: "limited", score: 46, rationale: "Auditor states impact immaterial" },
    ],
    status: "rejected",
    history: [AI_FLAGGED(), { at: "17 Nov · 10:14", text: "Rejected by Layla Haddad — immaterial per auditor; no IC impact" }],
  },
]

/** Sample files offered by the upload dialog — deterministic processing outcome. */
export const SAMPLE_UPLOADS = [
  { name: "Customer_Contracts_Top20.pdf", size: "8.4 MB", pages: 64, failsFirstAttempt: false },
  { name: "IT_Policy_Register_2024.docx", size: "1.2 MB", pages: 14, failsFirstAttempt: false },
  { name: "Scanned_Lease_Agreement.pdf", size: "5.9 MB", pages: 9, failsFirstAttempt: true },
]

/** Finding produced by analysing the sample upload (simulated). */
export const UPLOAD_FINDING: Finding = {
  id: "F-07",
  title: "Change-of-control termination rights in 2 of the top-3 customer contracts",
  severity: "high",
  category: "market",
  explanation: "Customers worth $19.6m revenue can terminate on 90 days' notice after the acquisition.",
  aiRationale:
    "The newly uploaded customer contracts contain change-of-control termination rights for two of the three largest customers. Combined with F-02, this creates a direct post-close revenue risk that should be addressed through consent letters before signing.",
  evidence: [
    { id: "E-07a", documentId: "upload-0", page: 18, excerpt: "Clause 14.2: The Customer may terminate this Agreement upon ninety (90) days' written notice if the Supplier undergoes a change of control.", strength: "strong", score: 91, rationale: "Same clause found in 2 contracts" },
  ],
  status: "needs-review",
  history: [{ at: "Just now", text: "Raised by AI analysis of uploaded documents (demo)" }],
  isNew: true,
}

export const ASSIGNEES = ["Omar Khalil — Commercial DD", "Priya Raman — Legal counsel", "James Whitfield — Operating partner"]
