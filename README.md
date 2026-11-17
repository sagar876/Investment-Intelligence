# Aurello AI — Investment Intelligence (MVP)

A single-screen, AI-assisted due-diligence workspace. An investment analyst evaluating **Meridian Technologies (UAE)** can see whether the deal is attractive, what the biggest risks are, *why* the AI raised each one, *where* the evidence is, and which findings still need a human decision — then submit to the Investment Committee once every Critical/High finding has been decided.

> **All data is fictional.** Meridian Technologies, its financials, the AI summary and every finding are illustrative demo data. There is no AI backend, database, authentication or external API.

- **Design:** [Figma — AurelloAI Investment Intelligence](https://www.figma.com/design/OxOBImRVz6XYbV9s0OCLOL) (Product Brief · Design System · Dashboard)
- **Spec, UX strategy & design review:** [`docs/superpowers/specs/2026-11-17-aurelloai-dashboard-design.md`](docs/superpowers/specs/2026-11-17-aurelloai-dashboard-design.md)

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # reducer / review-gate unit tests (Vitest)
npm run build      # typecheck + production build
```

Requires Node 20.19+ (built with Node 24).

### Walkthrough (≈3 minutes)

1. **Orient** — the hero shows the AI-*suggested* recommendation, its confidence and human-review progress (2 of 6). *Submit to IC* is locked and says why.
2. **Assess** — KPI tiles, the 3-year revenue/EBITDA chart (toggle to an accessible table), key metrics.
3. **Prioritise** — click *Regulatory* in Risk assessment: findings filter to that category (`aria-pressed`).
4. **Verify** — select a finding: the evidence panel shows the AI rationale, verbatim excerpts with document + page, and evidence strength with its reason. Citation chips in the AI summary jump straight to the evidence.
5. **Decide** — *Accept* (undoable toast), *Reject* (reason required, validated) or *Flag* (note + optional owner). Open the details drawer for tabs: Evidence / AI rationale / audit History.
6. **Complete** — decide F-01, F-02, F-03 → *Submit to IC* unlocks (and pulses briefly); confirm with an explicit attestation.
7. **New evidence** — *Upload documents* → *Use 3 sample documents*: per-file processing, a scanned PDF fails with a recoverable *Retry with OCR*, analysis adds a new High finding **F-07** that re-locks IC submission.
8. **Demo states** menu (header) — replay loading + AI analysis, empty data room, chart data error, reset.

## Stack

React 19 · Vite 8 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Radix, Nova) · Recharts · TanStack Table v9 · react-hook-form + zod/mini · sonner · lucide-react. Fonts self-hosted via Fontsource (Outfit, Instrument Sans, Geist Mono).

**Animation uses native CSS only** — transitions for interaction, `@keyframes` for entrances, chart/gauge stroke drawing, status changes and AI-processing indicators, staggered with registered (non-inheriting) custom properties. No animation library. `prefers-reduced-motion` disables motion globally (Recharts' built-in bar animation is switched off too).

## Architecture

```
src/
  data/meridian.ts          typed, deterministic mock data (fictional)
  types/domain.ts           domain model: Finding, Evidence, Decision, Kpi…
  state/
    review-reducer.ts       pure reducer + selectors (review gate, filters, audit trail) — unit-tested
    review-context.tsx      provider; simulated load/analysis phases
    ui-context.tsx          overlay orchestration, undoable decisions, focus restoration
  features/<region>/        one folder per dashboard region (header, overview, kpis, summary,
                            financials, risk, dataroom, findings, evidence, review, upload, dashboard)
  components/common/        domain primitives mirroring Figma components (badges, citation chip,
                            evidence-strength meter, section card)
  components/ui/            shadcn/ui primitives, restyled to brand tokens
  index.css                 design tokens (aurelloai.com palette), CSS motion system, a11y base styles
```

Key decisions:
- **Business rules live in a pure reducer** (`canSubmit`, `blockingFindings`, `reviewedCount`), so the human-in-the-loop guarantees are testable without rendering.
- **Evidence is reachable from every claim** — citation chips, table rows and the risk filter all route through one `openEvidence()` that uses the side panel on desktop and a drawer (bottom sheet on phones) elsewhere.
- **Brand tokens are CSS custom properties on shadcn's contract** (`--primary`, `--ring`, …) plus semantic AI/severity/chart tokens; names match the Figma variables' code syntax.

## Brand (from aurelloai.com)

| Role | Token | Hex | Source |
|------|-------|-----|--------|
| Ink / text | `--brand-ink` | `#0A1F3D` | site `--ink` |
| Primary (human action) | `--brand-blue` | `#0B3A7A` | site `--blue` |
| AI / teal | `--brand-teal` | `#0A8794` | site `--teal` |
| Highlight (dark surfaces, gradients) | `--brand-aqua` | `#22D3C5` | site `--aqua` |
| Hero night | `--brand-night` | `#07142A` | site dark `--bg` |
| Link | `--brand-link` | `#0B5FA8` | site `--link` |
| Border / chip / canvas | | `#D5E2E9` / `#EAF3F7` / `#F6F9FB` | site `--line` / `--chip` / `--bg` |
| AI small text (derived) | `--ai` | `#066670` | darkened for 5.9:1 |

Blue = human decisions and actions; teal/aqua = AI. Aqua (`#22D3C5`, 1.9:1 on white) is never used as text on light surfaces.

## Quality — verified

| Check | Result |
|-------|--------|
| axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice) | **0 violations** — desktop, open drawer, open dialog, mobile |
| Keyboard | skip link first; focus trapped in overlays and restored to the opener; visible 2px focus ring; `scroll-padding-top` for the sticky header (2.4.11) |
| Web vitals (production build, local) | LCP ≈ 1.1–1.3 s · CLS ≈ 0.01 · TBT ≈ 8 ms desktop / ≈ 240 ms at 4× CPU throttle |
| Bundle | critical JS ≈ 165 KB gzip; Recharts (106 KB) and overlays/forms (≈ 30 KB) lazy-loaded |
| Responsive | no horizontal overflow at 390 / 834 / 1024 / 1280 / 1440 |
| Tests | 11 reducer tests (review gate, flag semantics, submission lock, undo, audit trail, filters) |

## Known limitations

- Frontend-only; state resets on reload. Uploaded files are validated (type/size) but not parsed — processing outcomes are simulated deterministically.
- The Figma file was built before the brand pass; the starter-plan MCP call limit blocked the follow-up. [`docs/figma/rebrand-to-aurello.js`](docs/figma/rebrand-to-aurello.js) applies the aurelloai.com palette and type to every page in one call once access resets. Interaction-state and responsive frames are specified in the design doc and implemented in code.
