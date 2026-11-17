# AurelloAI — Investment Intelligence · Product Brief & Design Spec

**Status:** Approved scope (2026-11-17) · **Type:** Frontend-only portfolio MVP
**Purpose:** Interview demonstration for a Senior Frontend Engineer role — show the full path from enterprise problem → UX decisions → design system → editable Figma → production-quality React.

> All company data, metrics, AI summaries and findings in this project are **fictional, illustrative demo data**. No real AI, backend, database or auth.

---

## 1. Problem

Deal teams evaluating an acquisition drown in a data room: audited accounts, management packs, legal and HR reviews, contract registers. AI can read all of it fast — but an investment committee will not accept a conclusion it cannot trace. The real problem is not "summarise the data room"; it is **"let an analyst trust, verify and sign off on AI-assisted findings quickly."**

## 2. Persona

**Layla Haddad — Senior Associate, mid-market PE fund (Dubai)**
- Prepares the investment committee (IC) memo; personally accountable for every claim in it.
- Expert in financial statements; time-poor; works on a 1440px+ monitor, sometimes reviews on a tablet.
- Skeptical of AI: will use it if it saves time *and* shows its work.

## 3. Questions the dashboard must answer (in order of the analyst's mental model)

| # | Question | Where it is answered |
|---|----------|---------------------|
| 1 | Is this investment attractive? | Company overview recommendation + Financial snapshot + AI summary |
| 2 | What are the biggest risks? | Risk assessment (4 categories, severity) |
| 3 | Why did the AI identify these risks? | Finding explanation + AI rationale in details drawer |
| 4 | Where is the supporting evidence? | Evidence review: document, page, excerpt, evidence strength |
| 5 | Which findings require human review? | Review progress + "Needs review" filter + status column |

## 4. Design principles → concrete decisions

| Principle | Decision |
|-----------|----------|
| Evidence before conclusions | Every AI claim carries a citation chip (e.g. `F-02 · Legal DD p.12`) that opens the evidence. No uncited AI sentence ships. |
| Human judgment over automation | AI only *proposes*. Recommendation is labelled "AI-suggested"; final status is set by the analyst. "Submit to IC" is blocked until every Critical/High finding is reviewed. |
| Transparency over black boxes | Each finding shows evidence strength (Strong / Moderate / Limited) with a numeric score and the reason ("2 corroborating sources"). AI content has a consistent violet "AI-generated" marker distinct from the blue brand accent. |
| Density without clutter | 12-col grid, tabular numerals, 13–14px body for data, hierarchy by weight and colour not boxes; secondary detail moves into the drawer. |

## 5. Primary user journey

1. **Orient** — lands on Meridian Technologies; reads recommendation + review progress (`2 of 6 reviewed`).
2. **Assess** — scans 4 KPIs and the 3-year chart; reads the AI summary.
3. **Prioritise** — Risk assessment shows Regulatory = High; clicks it → findings table filters to Regulatory.
4. **Verify** — selects finding F-02 → Evidence panel shows source excerpt, page, strength.
5. **Decide** — Accept / Reject (requires reason) / Flag for follow-up (requires note + optional assignee).
6. **Complete** — when all Critical/High findings are reviewed, "Submit to IC" enables; confirmation dialog summarises decisions.

## 6. Information architecture (single dashboard, no routes)

```
Header ─ wordmark · product name · company selector · assessment status · last updated · analyst
Demo-data notice (persistent, dismissible per session)
Company overview ─ name, country, industry, period, AI-suggested recommendation, review progress, Submit to IC
Financial snapshot ─ Revenue · Revenue growth · EBITDA margin · Enterprise value
┌ 8 cols ───────────────────────────┐┌ 4 cols ─────────────┐
│ AI executive summary              ││ Risk assessment      │
│ Financial performance (chart)     ││ (4 categories)       │
└───────────────────────────────────┘└──────────────────────┘
┌ 7 cols ──────────────────────┐┌ 5 cols ─────────────────┐
│ Key findings (table)         ││ Evidence review (selected)│
└──────────────────────────────┘└──────────────────────────┘
Overlays: Finding details drawer (Sheet) · Upload documents dialog · Reject/Flag dialog · Submit-to-IC dialog
```

## 7. Critical interactions & decisions

- **Select finding** (row click / Enter) → updates Evidence panel; selection is announced (`aria-live`).
- **Open details** → right-side drawer: full AI rationale, all evidence items, decision history.
- **Accept** → immediate, toast with Undo.
- **Reject** → dialog, reason required (min 10 chars) — prevents silent dismissal of risk.
- **Flag** → dialog, note required, follow-up owner optional.
- **Filter findings** by severity / status; clicking a risk category filters by category.
- **Upload documents** → dialog with drop zone → processing state (per-file progress) → findings refreshed (simulated).
- **Submit to IC** → disabled with explanation until Critical/High are reviewed; confirmation dialog.

## 8. States

| State | Treatment |
|-------|-----------|
| Loading | Skeletons matching final layout (no layout shift) |
| Empty | No documents → upload CTA; no findings match filter → "Clear filters" |
| Processing | Per-document progress, "Analysing 3 of 5 documents" |
| Error | Inline alert on failed document with Retry; chart error fallback with table view |
| Edge | Very long finding titles truncate with tooltip; zero-finding category shows "No issues identified" not blank |

## 9. Accessibility (WCAG 2.2 AA)

- Text contrast ≥ 4.5:1 (body), ≥ 3:1 (large text, UI boundaries, chart marks).
- Severity never colour-only: icon + text label.
- Visible focus: 2px accent ring + 2px offset (2.4.7, 2.4.11 focus not obscured — sticky header accounted for via `scroll-padding-top`).
- Target size ≥ 24×24px (2.5.8).
- Full keyboard path through journey; skip link; landmarks (`header`, `main`, `section` with headings).
- Chart has a text/table alternative.
- Dialogs trap focus and restore it; toasts are polite live regions.
- `prefers-reduced-motion` respected.

## 10. Design tokens

**Colour**
| Token | Hex | Use |
|-------|-----|-----|
| bg/canvas | #F5F6F8 | App background |
| bg/surface | #FFFFFF | Cards |
| bg/subtle | #EFF2F6 | Table header, insets |
| border/default | #E2E6EC | Card & divider |
| border/strong | #C9D1DC | Emphasised dividers (decorative) |
| border/input | #7D8A9E | Form-control boundaries (3.5:1, WCAG 1.4.11) |
| text/primary | #0B1B33 | Deep navy headings & figures |
| text/secondary | #44526B | Body |
| text/muted | #5F6B80 | Labels, meta (≥4.5:1 on white) |
| accent/default | #2D5A9B | Muted blue — primary actions, links, focus |
| accent/hover | #234A82 | |
| accent/subtle | #EAF0F8 | Selected row, accent bg |
| ai/default | #5B4BB7 | AI-generated marker |
| ai/subtle | #F1EFFB | AI content background |
| severity/critical | #B42318 on #FEF3F2 | |
| severity/high | #B54708 on #FFF4EB | |
| severity/medium | #8A6100 on #FDF6DD | |
| severity/low | #2B6A4C on #EBF5EF | |
| positive | #1F7A4D on #EAF5EF | |
| chart/revenue | #1E3A64 | Bars |
| chart/ebitda | #4F86C6 | Line |

**Type (Geist, tabular figures for numbers)**
Display 28/36 semibold · H1 22/30 semibold · H2 16/24 semibold · Body 14/20 regular · Body-sm 13/20 · Label 12/16 medium · Overline 11/16 semibold uppercase +0.04em · Figure-lg 28/36 semibold tabular.

**Spacing** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 (8px base).
**Grid** 1440 frame, 12 cols, 64px margins, 24px gutters (col = 88px).
**Radius** 6 (controls/badges) · 8 (inputs, buttons) · 12 (cards).
**Shadow** sm `0 1px 2px rgba(11,27,51,.06)`; overlay `0 12px 32px rgba(11,27,51,.14)`.
**Focus** 2px #2D5A9B ring, 2px offset.

## 11. Demo data (fictional)

**Meridian Technologies LLC** · Dubai, UAE · Enterprise software & IT services (GCC public & financial sector) · Assessment period FY2022–FY2024 · Currency USD.

| | FY2022 | FY2023 | FY2024 |
|-|-------|-------|-------|
| Revenue ($m) | 48.2 | 61.5 | 74.8 |
| Growth | — | 27.6% | 21.6% |
| EBITDA ($m) | 8.7 | 12.3 | 13.5 |
| EBITDA margin | 18.0% | 20.0% | 18.0% |
| Recurring revenue % | 52% | 58% | 63% |

Enterprise value $325m (4.3× revenue, 24.1× EBITDA FY24).
AI-suggested recommendation: **Proceed to confirmatory diligence — with conditions** (confidence: Moderate).

Risk assessment (score/100): Regulatory **High 72** · Financial **Medium 58** · Market **Medium 48** · Operational **Medium 41** · Overall **Elevated 56**.

Findings:
| ID | Title | Severity | Category | Source | Status |
|----|-------|----------|----------|--------|--------|
| F-01 | Data-protection compliance gap under UAE PDPL | Critical | Regulatory | Legal DD Report, p.12 | Needs review |
| F-02 | Top-3 customers represent 41% of FY24 revenue | High | Financial | Audited Financial Statements FY24, p.34 | Needs review |
| F-03 | Government contract renewals concentrated in Q2 FY25 | High | Market | Contract Register, p.21 | Flagged |
| F-04 | EBITDA margin contracted 2.0pts in FY24 | Medium | Financial | Management Accounts Q4 FY24, p.8 | Accepted |
| F-05 | Key-person dependency on CTO and 2 architects | Medium | Operational | HR & Organisation Review, p.5 | Needs review |
| F-06 | Change in revenue-recognition policy for multi-year licences | Low | Financial | Audited Financial Statements FY24, p.47 | Rejected |

## 12. Figma plan (Starter plan: 3 pages)

- **00 — Product Brief:** problem, persona, questions, principles, journey, IA, a11y checklist.
- **01 — Design System:** variables (colour, spacing, radius), text styles, effect styles, components (Button, Badge/Severity, Status, AI label, Card, KPI tile, Table row, Input, Citation chip).
- **02 — Dashboard:** sections — *Desktop 1440* (hero), *Interaction states* (drawer, upload, processing, reject/flag dialog, submit-to-IC, empty, error, loading), *Responsive* (tablet 834, mobile 390).

## 13. Frontend architecture (summary)

- `src/data/` typed mock data · `src/types/` domain types
- `src/features/<section>/` one folder per dashboard section
- State: `useReducer` review store in context (no external state lib — small surface)
- Recharts lazy-loaded below the fold; fonts self-hosted; target LCP < 1.5s on local build, CLS ≈ 0
- Accessibility verified with keyboard pass + axe

## 14. Non-goals

Real AI calls, persistence beyond session, auth, multiple routes, dark mode, multi-company data (selector shows Meridian + 2 disabled placeholders).

## 15. Figma file & build status (2026-11-17)

File: https://www.figma.com/design/OxOBImRVz6XYbV9s0OCLOL

| Page | Status |
|------|--------|
| 00 — Product Brief | Done: problem, persona, 5 questions, principles→decisions, journey, IA, states, a11y |
| 01 — Design System | Done: 4 variable collections (26 primitives, 29 semantic colours with CSS code syntax, 8 spacing, 4 radius), 12 text styles, 3 effect styles; components: 23 icons, Button (16 variants, label/icon props), Badge/Severity, Badge/Status, AI Label, Citation Chip, Evidence Strength, Input, Card Header, KPI Tile, Risk Row, Table Header, Finding Row (3 states), Evidence Item |
| 02 — Dashboard | Desktop 1440 done (all sections A–H). Interaction-state and responsive frames **not built**: blocked by Figma Starter MCP tool-call limit |

Known Figma defect: icon on Primary buttons ("Accept finding", "Submit to IC") lost its white override after instance swap; fix by setting the icon stroke to `text/on-accent`.

## 16. Design review (pre-implementation)

Reviewed against the 1440 composition screenshots.

**Working well**
- Hierarchy follows the analyst's five questions top-to-bottom: recommendation → KPIs → summary/risk → findings → evidence.
- AI transparency: every AI region carries the violet "AI-generated · Demo data" marker; every AI claim has a citation chip; the evidence panel shows *why* (rationale) before *what to do* (decision).
- Human-in-the-loop: "Submit to IC" is gated with the reason stated next to it; decisions are logged.
- Severity/status never rely on colour alone (icon + label); all text pairs ≥ 4.5:1; input boundaries 3.5:1.
- Financial comprehension: direct value labels, EBITDA margin printed under each year, Chart/Table toggle as accessible alternative; DSO deterioration called out.

**Issues → resolution in code**
1. *False affordance:* "Confidence: Moderate" is a bordered pill that reads like a button → render as plain text with a label.
2. *Redundant action:* "Upload documents" appears in header and Data room → keep the header action; Data room gets a text link.
3. *Disabled Submit:* 50% opacity is exempt from contrast, but disabled buttons are unfocusable → use `aria-disabled` + `aria-describedby` pointing to the gate hint so keyboard/SR users learn why.
4. *Risk rows are filters:* need a visible selected state and `aria-pressed`; Figma only implies it with a tint.
5. *Uneven row heights:* long finding titles wrap → clamp to 2 lines with full title in tooltip and drawer.
6. *Column height imbalance:* evidence panel is taller than the findings table → make it sticky with internal scroll on desktop.
7. *Header density at < 1280px:* collapse "Updated…" into a tooltip and the analyst name into the avatar.
8. *Focus order:* DOM order must match visual order (findings before evidence); selecting a row announces "Evidence updated for F-0x" via `aria-live`.
9. *Sticky header vs focus (2.4.11):* set `scroll-padding-top` to header height.

**States & responsive** (not drawn in Figma, specified here and built in code with the same components): details drawer (Sheet, 480px), upload dialog, processing with per-file status + failed-file Retry, reject dialog (reason ≥ 10 chars), flag dialog (note + optional owner), submit-to-IC confirmation, undo toast, empty (no docs / no filter match), skeleton loading, chart error → table fallback. Tablet 834: 8-col, analysis columns stack, evidence opens in drawer. Mobile 390: single column, KPI 2×2, findings as cards, evidence in bottom sheet.

## 17. Implementation decisions (2026-11-17, after Figma)

**Brand alignment.** Palette and type were extracted from aurelloai.com's CSS custom properties and embedded logo (see README "Brand"). This supersedes the provisional palette in §10: ink `#0A1F3D`, blue `#0B3A7A`, teal `#0A8794`, aqua `#22D3C5`, night `#07142A`; type Outfit (display) + Instrument Sans (body). The violet AI colour from the first Figma pass is replaced by the brand teal family — blue now means *human action*, teal means *AI*. Pending Figma update: `docs/figma/rebrand-to-aurello.js`.

**Visual direction change vs. the Figma desktop frame.** The header + company overview sit on a dark brand "night" band with slow ambient light (echoing aurelloai.com), with KPI cards layered over its edge. Everything below stays light for readability. Section order, hierarchy and components match the approved Figma frame.

**Motion.** Native CSS only (per direction): transitions for hover/press/progress; keyframes for staggered entrances, sparkline/gauge stroke drawing, risk-bar growth, status pops, evidence slide-in, AI-processing indicator. Stagger inputs are `@property`-registered with `inherits: false` so delays never cascade. Loops only on loading/processing indicators, a 3-iteration pulse when IC submission unlocks, and a 28–40 s ambient drift. Reduced motion zeroes durations *and* delays.

**Load behaviour.** A normal visit shows a 650 ms skeleton then the already-analysed assessment (LCP ≈ 1.1 s). The animated AI-analysis phase plays only after uploading documents or via *Demo states → Replay*, which is also more truthful: the assessment was last analysed at 09:42.

**Design-review issues (§16) — resolution.** 1 confidence shown as text, not a pill · 2 single primary Upload in header, data room keeps an empty-state CTA · 3 Submit uses `aria-disabled` + `aria-describedby` · 4 risk rows are `aria-pressed` toggles with a selected style · 5 titles clamp to 2 lines with full title in `title` + drawer · 6 evidence panel is sticky with internal scroll · 7 header progressively collapses (product name ≥1280, upload label ≥1024, analyst name ≥1536) · 8 DOM order = visual order, selection announced via `aria-live` · 9 `scroll-padding-top` set.

**Accessibility fixes found by axe during QA.** Translucent sticky header lost contrast over light content → made solid; inactive tab text 4.25:1 → muted token 4.6:1; invalid `<dl>` structure; selector accessible-name mismatch; demo notice placed in an `aside` landmark; focus restoration added for programmatically opened overlays.
