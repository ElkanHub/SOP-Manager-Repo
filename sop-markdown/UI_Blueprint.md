# UI & DESIGN SPECIFICATION: SOP-Guard Pro

**Developer Reference — Screens, Components, Tokens & Interactions**
*Light Mode | Inter typeface | Tailwind CSS + Shadcn/UI | Industrial SaaS aesthetic*

---

## How to Use This Document

This document is written for the developer building SOP-Guard Pro. Each section covers a screen or component with:

1. **Wireframe zone map** showing layout regions.
2. **Content and behaviour spec** for each zone.
3. **Component props and states**.
4. **DEV NOTES** for implementation details.

*Read the Design System section first — it defines the tokens and components referenced throughout.*

---

## TABLE OF CONTENTS

- [SECTION 1 — Design Philosophy & Visual Direction](#section-1--design-philosophy--visual-direction)
- [SECTION 2 — Design Tokens](#section-2--design-tokens)
- [SECTION 3 — Global Layout](#section-3--global-layout)
- [SECTION 4 — Authentication Screens](#section-4--authentication-screens)
- [SECTION 5 — Dashboard](#section-5--dashboard)
- [SECTION 6 — SOP Library](#section-6--sop-library)
- [SECTION 7 — SOP Submission & QA Approval](#section-7--sop-submission--qa-approval)
- [SECTION 8 — Change Control Center](#section-8--change-control-center)
- [SECTION 9 — Preventive Maintenance Planner](#section-9--preventive-maintenance-planner)
- [SECTION 10 — Company Calendar](#section-10--company-calendar)
- [SECTION 11 — Notice System](#section-11--notice-system)
- [SECTION 12 — Reports & Audit Logs](#section-12--reports--audit-logs)
- [SECTION 13 — Component Library](#section-13--component-library)
- [SECTION 14 — Micro-Interactions & Animation](#section-14--micro-interactions--animation)
- [SECTION 15 — Responsive Behaviour](#section-15--responsive-behaviour)
- [SECTION 16 — Accessibility Baseline](#section-16--accessibility-baseline)
- [SECTION 17 — Tailwind Configuration](#section-17--tailwind-configuration)
- [Appendix — Icon Reference](#appendix--icon-reference)

---

## SECTION 1 — Design Philosophy & Visual Direction

SOP-Guard Pro is an industrial compliance tool. The UI must communicate authority, clarity, and trust — not playfulness. Every design decision reinforces that this is a serious platform where mistakes have real consequences.

### 1.1 Core Design Principles

| Principle | What It Means in Practice |
| :--- | :--- |
| **Clarity over decoration** | No unnecessary gradients, shadows, or animations. Every element earns its place. White space is used generously to let content breathe. |
| **Status is always visible** | The user should never have to dig to understand what state a document, task, or approval is in. Colour, icons, and labels make status unmissable. |
| **Trust through consistency** | Every button, table, badge, and form behaves identically across all pages. Developers should build components once and reuse everywhere. |
| **Information density with control** | Enterprise users need to see a lot at once. The layout is dense but structured — not cluttered. Collapsible panels and tabs manage overflow. |
| **Light mode only (MVP)** | A clean white and slate palette. Dark mode is a Phase 2 enhancement. Do not invest in dark mode tokens for MVP. |

### 1.2 Visual Inspiration

The UI draws from three design traditions, combined into a single coherent language:

- **Linear (linear.app)** — clean navigation, crisp typography, confident use of white space, keyboard-first design patterns.
- **Notion** — tab-based document management, sidebar hierarchy, calm neutral palette for content-heavy pages.
- **Industrial SaaS dashboards** (e.g. Grafana, PagerDuty) — dense KPI widgets, status badges, alert-driven colour logic. Status red means something. Green means all clear.

> [!NOTE]
> **DESIGN INTENT:** The app should feel like a tool a senior QA engineer would trust with compliance data — not a flashy startup product. Avoid rounded-everything, emoji-heavy, or consumer-app aesthetics.

---

## SECTION 2 — Design Tokens

### 2.1 Colour Palette

All colours are defined as CSS custom properties and mapped to Tailwind config. Never use raw hex in component code — always reference a token.

#### PRIMARY — BRAND & NAVIGATION

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Navy-900** | `#0D2B55` | Sidebar bg, headings, logo |
| **Blue-700** | `#1A5EA8` | H2 headings, links, active states |
| **Blue-500** | `#2E86DE` | Hover states, secondary links |
| **Blue-100** | `#DBEAFE` | Selected row bg, active tab bg |

#### ACCENT — ACTIONS & HIGHLIGHTS

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Teal-500** | `#00C2A8` | Primary CTA buttons, divider lines, focus rings |
| **Teal-100** | `#CCFBF1` | Success banner bg, acknowledged badge bg |
| **Teal-700** | `#0F766E` | Primary button hover state |

#### SEMANTIC — STATUS & FEEDBACK

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Red-600** | `#DC2626` | Pending approvals, overdue items, error states |
| **Red-100** | `#FEE2E2` | Overdue row bg, error banner bg |
| **Amber-600** | `#D97706` | Warnings, draft status badge |
| **Amber-100** | `#FEF3C7` | Warning banner bg, draft row bg |
| **Green-600** | `#059669` | Active status, approved, complete |
| **Green-100** | `#D1FAE5` | Active row bg, success toast bg |

#### NEUTRAL — SURFACES & TEXT

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Slate-800** | `#1E293B` | Primary body text |
| **Slate-500** | `#64748B` | Secondary text, labels, placeholders |
| **Slate-300** | `#CBD5E1` | Borders, dividers, input outlines |
| **Slate-100** | `#F1F5F9` | Alternate table rows, card bg |
| **Slate-50** | `#F8FAFC` | Page background |
| **White** | `#FFFFFF` | Cards, panels, modal backgrounds |

### 2.2 Typography

**Font:** Inter (Google Fonts). Load weights 400, 500, 600, 700 only. No other typefaces in MVP.

| Token | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-display` | 36px / 2.25rem | 700 | 1.2 | Page titles on auth screens only |
| `text-h1` | 28px / 1.75rem | 700 | 1.3 | Section headings within pages |
| `text-h2` | 20px / 1.25rem | 600 | 1.4 | Sub-section headings, card titles |
| `text-h3` | 16px / 1rem | 600 | 1.5 | Widget labels, table section headers |
| `text-body-lg` | 15px / 0.9375rem | 400 | 1.6 | SOP viewer body text, descriptions |
| `text-body` | 14px / 0.875rem | 400 | 1.5 | Default UI body text |
| `text-body-sm` | 13px / 0.8125rem | 400 | 1.4 | Table cell content, meta labels |
| `text-label` | 12px / 0.75rem | 500 | 1.3 | Form labels, status badge text — UPPERCASE |
| `text-mono` | 13px / 0.8125rem | 400 | 1.4 | SOP version numbers, IDs, code references |

### 2.3 Spacing Scale

Use Tailwind's default spacing scale. Key values to build around:

| Token | Value | Common Usage |
| :--- | :--- | :--- |
| `space-1` | 4px | Icon padding, badge padding |
| `space-2` | 8px | Tight item gaps, inner cell padding |
| `space-3` | 12px | Default cell padding, form field gap |
| `space-4` | 16px | Card padding, sidebar item padding |
| `space-6` | 24px | Section gap within a card |
| `space-8` | 32px | Card-to-card gap, major section spacing |
| `space-12` | 48px | Page section break spacing |

### 2.4 Border Radius

| Token | Value | Usage |
| :--- | :--- | :--- |
| `rounded-sm` | 4px | Badges, tags, small chips |
| `rounded` | 6px | Buttons, input fields, table cells |
| `rounded-md` | 8px | Cards, dropdowns, modals |
| `rounded-lg` | 12px | Large panels, sidebar sections |
| `rounded-full` | 9999px | Avatar, status dot, toggle |

### 2.5 Shadow Scale

| Token | CSS Value | Usage |
| :--- | :--- | :--- |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Table rows on hover, inactive cards |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Default cards, input focus |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Dropdowns, modals, floating panels |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | The Pulse sidebar, overlay sheets |

---

## SECTION 3 — Global Layout

All authenticated pages share one persistent shell layout. This shell never unmounts between navigations.

### 3.1 Shell Layout Map

```
+-----------------------------------------------------------------------+
|                              TOP NAV BAR                              |
|   48px fixed height — logo, global search, user avatar, notifications |
+--------------+----------------------------------------+---------------+
| LEFT SIDEBAR |          MAIN CONTENT AREA             |   THE PULSE   |
| 240px fixed  |          Flexible width                |   300px fixed |
| Dept tabs    |          Page content renders here      |   Tasks/Alerts|
| Navigation   |                                        |               |
+--------------+----------------------------------------+---------------+
```

### 3.2 Top Navigation Bar

| Zone | Content | Behaviour |
| :--- | :--- | :--- |
| **Left — Logo** | SOP-Guard Pro wordmark + app icon | Clicking navigates to the home dashboard |
| **Centre — Global Search** | Search input: 'Search SOPs, equipment, notices...' | Triggers AI-powered search across the SOP library. Opens a command-palette-style dropdown with categorised results. |
| **Right — User Zone** | Notification bell (with unread badge count) + user avatar + dropdown arrow | Bell opens a quick-view panel of recent Pulse items. Avatar dropdown shows Profile, Settings, Sign Out. |

> [!NOTE]
> **DEV NOTE:** Top nav is sticky (`position: fixed`, `z-index: 50`). Main content area has `padding-top: 48px` to compensate. The Pulse sidebar is also fixed and starts below the nav bar.

### 3.3 Left Sidebar

The sidebar is data-driven — generated from the department nodes in the database. It never needs a code change when a new department is added.

- **Department section header:** Small ALL-CAPS label: 'MY DEPARTMENT'. Below it, the user's department name as a nav tab.
- **QA exception:** QA users see a second section: 'ALL DEPARTMENTS' listing all dept tabs below their own. Non-QA users never see this section.
- **Nav links (below dept tabs):** Dashboard, SOP Library, Equipment, Calendar, Reports. These are global links visible to all roles.
- **Active state:** Active tab/link: `bg-blue-100`, left border 3px `teal-500`, text `font-weight 600`.
- **Collapsed state (mobile):** Sidebar collapses to icon-only strip (56px). Labels hidden. Dept names show as initials badge.
- **Bottom of sidebar:** Settings link (gear icon) + current user role badge (Admin / Manager / Worker).

### 3.4 The Pulse Sidebar

Fixed right panel. 300px wide. Always visible on desktop. Slides in from right on mobile (triggered by bell icon in top nav).

- **Header:** Title: 'The Pulse'. Subtitle showing unread count: '3 items need attention'. Refresh icon.
- **Priority Section:** Red-badged items first: Pending Approvals (QA/Managers), Overdue PM tasks. Each item is a clickable row that navigates to the relevant page.
- **Today Section:** Today's PM tasks. New unread notices. SOPs requiring acknowledgement.
- **Notices Section:** Received notices with Acknowledged button. Author, timestamp, audience label visible per notice.
- **To-Do Section:** Personal to-do checklist. + Add Task input at the bottom. Completed items shown greyed with strikethrough.
- **Send Notice Button:** Fixed at the bottom of the Pulse. Opens the Notice Composer modal.

> [!NOTE]
> **DEV NOTE:** The Pulse is powered by Supabase Realtime. Subscribe to changes on: `sop_approval_requests`, `pm_tasks`, `notices`, and `change_controls` tables filtered by current user's `dept_id` and role. New items animate in with a slide-down + fade transition (200ms ease-out).

## SECTION 4 — Authentication Screens

### 4.1 Login Page

A centred, minimal page. No sidebar. No nav. The only entry point for unauthenticated users.

#### Layout

- **BACKGROUND:** Full-screen bg: `slate-50`
- **LEFT PANEL:** Navy bg — branding, app name, tagline
- **RIGHT PANEL:** White card — email, password, submit, sign up link

#### Element Specifications

- **App Name (Left):** "SOP-Guard Pro" in white, `text-display` weight 700.
- **Tagline (Left):** "The compliance platform that never misses." in `text-body-lg`, `slate-300`.
- **Feature Callouts (Left):** 3 short bullet lines: checkmark icon + one-line description. Text `slate-200`.
- **Form Card:** `bg-white`, `rounded-lg`, `shadow-md`. Padding: 40px. Max-width: 420px.
- **Email Input:** Full-width. Label: 'Work Email'. Placeholder: '<you@company.com>'.
- **Password Input:** Full-width. Label: 'Password'. Show/hide toggle icon.
- **Sign In Button:** Full-width. `bg-teal-500`, `text-white`, `font-weight 600`. Height: 44px.
- **Links:** "Create your account" link below button. `text-blue-500`.

> **STATES:**
>
> - **Error:** Red border on input + message below. 'Invalid credentials' as a red banner.
> - **Loading:** Button shows spinner, disabled.

---

### 4.2 Onboarding Flow (New User)

A multi-step wizard (5 steps) with a progress indicator.

| Step | Fields | Notes |
| :--- | :--- | :--- |
| **1 — Account** | Name, Email, Password | Standard validation. Email unique. |
| **2 — Department** | Dept Select | QA sees all; others see assigned. |
| **3 — Role** | Manager \| Worker | Large cards with icons + 1-line description. |
| **4 — Profile** | Title, ID, Phone, Photo | Photo shows circular preview. |
| **5 — Signature** | Draw OR Upload | Canvas: white bg, navy stroke. Preview before confirm. |

> [!NOTE]
> **DEV NOTE:** Use a step state machine. Validate before each 'Next'. Signature canvas: use `react-signature-canvas`.

---

## SECTION 5 — Dashboard

Adapts based on role. Focuses on a "10-second health check."

### 5.1 Layout Map

```
+-----------------------------------------------------------------------+
| PAGE HEADER: Title [SOP-Guard Pro] | Dept [QA] | Date [01 Mar] [Button] |
+-----------------------------------------------------------------------+
| [ KPI: SOPs ] | [ KPI: Pending ] | [ KPI: PM % ] | [ KPI: Revision ]  |
+---------------------------------+-------------------------------------+
|      RECENT ACTIVITY FEED       |             UPCOMING PM             |
|    Last 10 actions in dept      |          Next 5 due dates           |
+---------------------------------+-------------------------------------+
|                        DEPT SOP STATUS TABLE                          |
|                  Top 10 SOPs by Status/Due Date                       |
+-----------------------------------------------------------------------+
```

### 5.2 KPI Cards

| Card | Value | Colour Logic | On Click |
| :--- | :--- | :--- | :--- |
| **Total Active SOPs** | Integer | `blue-100` bg (Neutral) | SOP Library (Filtered: Active) |
| **Pending Approvals** | Integer | `red-100` if > 0; else `green-100` | QA Approval Queue |
| **PM Compliance %** | Gauge % | `green` > 90%; `red` < 70% | PM Planner |
| **SOPs Due for Revision** | Integer | `amber-100` if > 0 | SOP Library (Filtered: Due Date) |

### 5.3 Recent Activity Feed

Scrollable list of the last 10 actions in the department.

- **Format:** `[Initials] [Name] [Action] [Object] — [Time]`
- **Verbs:** Uploaded, Submitted, Approved, Signed, Completed PM, Acknowledged.
- **Action:** Clicking navigates to the relevant entity.

> [!NOTE]
> **DEV NOTE:** Query `audit_log` JOIN `users`. Use Supabase Realtime for live updates.

---

## SECTION 6 — SOP Library

The central document repository. Primary working surface for QA and Managers.

### 6.1 Layout Map

```
+-----------------------------------------------------------------------+
| TOOLBAR: [ Search... ] [ Filters (Dept/Status) ] [ + Upload SOP ]     |
+-----------------------------------------------------------------------+
| TABS: [ SOP-084... x ] [ SOP-122... x ] [ + ]                         |
+------------------------------------------+----------------------------+
|             SOP LIST TABLE               |       FILTER PANEL         |
|        (SOP No, Title, Dept, Status)     |   Status, Date, Author     |
+------------------------------------------+----------------------------+
```

### 6.2 SOP Table Columns

| Column | Data | Width | Notes |
| :--- | :--- | :--- | :--- |
| **SOP No.** | SOP-084 | Narrow | Mono font. Opens in tab. |
| **Title** | Full name | Wide | Truncated; tooltip on hover. |
| **Department** | Badge | Medium | Color-coded by dept. |
| **Version** | v2.1 | Narrow | Mono font. Teal. |
| **Status** | Badge | Medium | Active / Draft / Pending / Superseded. |
| **Due Date** | DD MMM YYYY | Narrow | Red if overdue. Amber < 30 days. |
| **Actions** | `...` menu | Narrow | View, Edit, History. |

### 6.3 Document Tab Viewer

Opens within the app (not browser tabs). Multiple SOPs can be open.

- **Tab Strip:** SOP number + title. Active: white bg, teal border.
- **Viewer Area:** `mammoth.js` converted HTML. Max-width `860px`.
- **Action Bar (Right):** Floating panel with "Acknowledge" (Workers), "Submit Edit", "Version History".
- **Version History:** Slide-over from right. Superseded versions show a watermark.

> [!NOTE]
> **DEV NOTE:** The "Acknowledge" button calls a Supabase RPC to insert into `sop_acknowledgements`.

---

## SECTION 7 — SOP Submission & QA Approval

### 7.1 Upload / Submit Edit Flow

Opens as a multi-step modal.

| Step | Fields | Notes |
| :--- | :--- | :--- |
| **1 — File** | Drag & Drop | `.docx` only. 25MB limit. |
| **2 — Metadata** | No, Title, Dept | Auto-fills from profile where possible. |
| **3 — Notes** | Textarea | Notes for QA reviewer (500 chars). |
| **Result** | Success Screen | "Submitted for QA review." |

### 7.2 QA Approval Page

Opened from Pulse notifications. Full-page comparison/review view.

- **Request Header:** SOP details, requester info, timestamp.
- **Approval Panel:**
  - **Approve Button:** `bg-green-600`. Prompts for Active/Change Control issue.
  - **Request Changes:** `bg-amber-500`. Opens comment textarea.
  - **Thread History:** Chronological list of comments and re-submissions.

---

## SECTION 8 — Change Control Center

Accessible to Managers and QA. Handles approved SOP updates.

### 8.1 Layout Map

```
+-----------------------------------------------------------------------+
| HEADER: [ SOP-084 ] [ CC-1290 ] [ Status: Pending Signatures ]        |
+-----------------------------------+-----------------------------------+
|          DIFF VIEWER              |       SIGNATURES & AI             |
|  [ Side-by-side comparison ]      |  [ AI Summary of Changes ]        |
|  [ Red vs Green Highlighting ]    |  [ Signatory Grid ] [ Sign Button]|
+-----------------------------------+-----------------------------------+
```

### 8.2 Diff Viewer

- **Style:** Two-column. Left: old (`bg-red-50`), Right: new (`bg-green-50`).
- **Precision:** Line-level diffing. Highlights entire changed paragraphs.
- **Toolbar:** Toggle "Show All" vs "Show Changes Only."

### 8.3 AI Delta Summary Panel

- **AI Summary:** Card at top-right. Generated by **Gemini pro**. 3–5 bullet points of substantive changes.
- **Review Warning:** "This summary is AI-generated. Review the full diff before signing."

### 8.4 Signature Grid

- **Status:** Shows "X of Y signed".
- **Rows:** Avatar + Name + Status (Signed / Pending).
- **Sign Button:** Triggers modal with signature preview.
- **Logging:** Logs name, ID, timestamp, and IP to `signature_certificates`.
- **Finalise:** When complete, a green banner confirms the new version is **Active**.

## SECTION 9 — Preventive Maintenance Planner

### 9.1 Layout Map

```
+-----------------------------------------------------------------------+
| TOOLBAR: [ List / Calendar ] [ Dept Filter ] [ + Add Equipment ]      |
+------------------------------------------+----------------------------+
|           ASSET REGISTRY TABLE           |      PM MINI-CALENDAR      |
|    ID, Asset Name, Dept, SOP, Due Date   |    Month View with dots    |
|    (List of all approved assets)         |    for upcoming tasks      |
+------------------------------------------+----------------------------+
```

### 9.2 Asset Registry Table

| Column | Detail |
| :--- | :--- |
| **Asset ID** | Unique ID. Monospace, teal. |
| **Asset Name** | Bold. Opens Asset Detail Sheet. |
| **Department** | Dept badge (colour-coded). |
| **Linked SOP** | SOP number link; opens in viewer. |
| **Frequency** | Daily / Weekly / Monthly / Quarterly badge. |
| **Last Serviced** | Date (Red if overdue before completion). |
| **Next Due** | Red if past; Amber < 7 days; else Green. |
| **Status** | On Track / Due Soon / Overdue / Pending QA. |

> [!NOTE]
> **DEV NOTE:** 'Pending QA Approval' assets are only visible to QA and the submitting department.

### 9.3 Asset Detail Sheet

Opens as a right-side slide-over panel.

- **Header:** Asset name, ID, status badge, QR code (SVG).
- **Details:** Serial No, model, photo, linked SOP, frequency.
- **Service History:** Chronological list of completed tasks (Worker, Date, Notes, Photo).
- **Action:** [+ Schedule PM Task] button opens log form.

### 9.4 PM Calendar View

- **Event Chip:** Teal bg, asset name. Click opens Detail Sheet.
- **Overdue:** Red bg chips.
- **Indicator:** Today is highlighted with a teal ring.

---

## SECTION 10 — Company Calendar

Global calendar for company-wide and department events.

### 10.1 Layout Map

```
+-----------------------------------------------------------------------+
| TOOLBAR: [ Month / Week ] [ Dept Filter ] [ + New Event ] [ Legend ]  |
+------------------------------------------+----------------------------+
|             CALENDAR GRID              |     UPCOMING EVENTS          |
|    Main month/week interactive view    |     Next 7 days' events      |
+------------------------------------------+----------------------------+
```

### 10.2 Event Types & Visual Coding

| Event Type | Chip Colour | Visibility |
| :--- | :--- | :--- |
| **Public Company** | `bg-blue-600` | Everyone |
| **Dept Event** | `bg-purple-500` | Current Dept Only |
| **PM Maintenance** | `bg-teal-500` | Everyone (Auto) |
| **Overdue PM** | `bg-red-600` | Everyone (Auto) |

### 10.3 New Event Modal

- **Fields:** Title, Date, Time (optional), Description, Visibility (Personal/Public).
- **Rules:** Workers default to Personal. Public events by Workers are flagged for Managers.
- **Auto-Sync:** PM events are auto-generated from PM Planner.

---

## SECTION 11 — Notice System

### 11.1 Notice Composer Modal

Triggered from The Pulse sidebar.

| Field | Specification |
| :--- | :--- |
| **To** | Audience: Everyone, Dept, or Individuals. |
| **Subject** | Short text (max 80 chars). Required. |
| **Message** | Textarea (max 500 chars). Required. |
| **Send** | `bg-teal-500`. Triggers success toast. |

### 11.2 Notice Display in The Pulse

- **Notice Item:** Sender avatar, subject (bold), 80-char preview, timestamp, and **Acknowledged** button.
- **Acknowledged Button:** Toggles from `bg-slate-100` to `bg-green-100` with a checkmark.
- **Manager View:** Progress bar showing "X of Y recipients acknowledged."

> [!NOTE]
> **DEV NOTE:** Delivery via Supabase Realtime broadcast. Toast notification shown on arrival: slide-in from top-right.

---

## SECTION 12 — Reports & Audit Logs

### 12.1 Layout Map

```
+------------------+----------------------------------------------------+
| REPORT SELECTOR  |              REPORT VIEWER                         |
| [ List of rpts ] |  [ Filter Bar: Date, Dept, Status ]  [ Export ]    |
| [ Audit Log    ] |                                                    |
| [ Compliance   ] |  [ Scrollable Results Table / Chart ]              |
+------------------+----------------------------------------------------+
```

### 12.2 Report Viewer Components

- **Filter Bar:** Date range, Dept, Status.
- **Export Button:** PDF / CSV options.
- **AI Risk Insights:** Special card rendering risk level (Low/Med/High) and Gemini-generated summary.

> [!NOTE]
> **DEV NOTE:** CSV export is MVP. PDF export via `react-pdf` or server-side Puppeteer is Phase 2.

---

## SECTION 13 — Component Library

Built as shared components in `/components/ui/` using Shadcn/UI primitives.

### 13.1 Status Badge

`<StatusBadge />` — Pill-shaped status indicator.

| Prop | Type | Default | Notes |
| :--- | :--- | :--- | :--- |
| `status` | `enum` | — | `active`, `draft`, `pending`, `overdue`, etc. |
| `size` | `string` | `md` | `sm`, `md`, `lg`. |
| `showIcon`| `bool` | `true` | Shows coloured dot before label. |

### 13.2 KPI Card

`<KpiCard />` — Dashboard metric widget.

| Prop | Type | Default | Notes |
| :--- | :--- | :--- | :--- |
| `title` | `string` | — | Metric label. |
| `value` | `str/num`| — | Main metric (e.g., "94%"). |
| `icon` | `node` | — | Lucide icon. |
| `color` | `string` | `blue` | `blue`, `red`, `green`, `amber`. |
| `trend` | `object` | `null` | `{ value, direction, label }`. |

### 13.3 Data Table

`<DataTable />` — Based on TanStack Table v8.

| Prop | Type | Default | Notes |
| :--- | :--- | :--- | :--- |
| `columns` | `array` | — | Column definitions. |
| `data` | `array` | — | Generic row data. |
| `loading` | `bool` | `false` | Shows skeleton rows. |
| `onRowClick` | `fn` | `null` | Hover effect enabled if provided. |

### 13.4 SlideOver Panel

`<SlideOver />` — Right-side slide-in drawer.

| Prop | Type | Default | Notes |
| :--- | :--- | :--- | :--- |
| `open` | `bool` | `false` | Visibility state. |
| `onClose` | `fn` | — | Callback on dismiss. |
| `title` | `string` | — | Header title. |
| `width` | `string` | `md` | `sm` (320px) to `lg` (644px). |

### 13.5 Toast Notification

`<Toast />` — Temporary pop-up alert.

| Prop | Type | Default | Notes |
| :--- | :--- | :--- | :--- |
| `type` | `string` | `info` | `success`, `error`, `warning`, `notice`. |
| `title` | `string` | — | Bold header. |
| `duration`| `number` | `4000` | Auto-dismiss time in ms. |

### 13.6 Confirm Dialog

`<ConfirmDialog />` — Blocking modal for confirmation.

| Prop | Type | Default | Notes |
| :--- | :--- | :--- | :--- |
| `title` | `string` | — | Specific heading (e.g., "Delete SOP?"). |
| `variant` | `string` | `danger`| `danger`, `primary`, `warning`. |
| `onConfirm`| `fn` | — | Confirmation callback. |

## SECTION 14 — Micro-Interactions & Animation

All animations must feel instant and purposeful — never decorative. Default easing: `ease-out`. Duration ceiling: 250ms for UI transitions, 600ms max for data transitions.

### 14.1 Transition Catalogue

| Interaction | Animation | Duration | Easing |
| :--- | :--- | :--- | :--- |
| **Page navigation** | Fade in (opacity 0 -> 1) | 150ms | `ease-out` |
| **Sidebar tab change** | Left border slides in + bg fades | 150ms | `ease-out` |
| **Pulse new item** | Slide down + fade in from top | 200ms | `ease-out` |
| **SOP tab opens** | Tab slides in from right | 150ms | `ease-in-out` |
| **SlideOver panel** | Translate X from +100% to 0 | 200ms | `ease-out` |
| **Modal open** | Scale 0.95 -> 1 + opacity 0 -> 1 | 150ms | `ease-out` |
| **Toast notification** | Slide in from top-right + fade | 200ms | `ease-out` |
| **KPI number** | Numeric count-up animation | 600ms | `ease-out` |
| **Status change** | Background colour crossfade | 200ms | `ease-in-out` |
| **Row hover** | `bg-slate-50` -> `bg-blue-50` | 100ms | `ease-out` |
| **Button press** | Scale 0.97 | 80ms | `ease-out` |
| **Signature draw** | Smooth bezier curve rendering | Real-time | `requestAnimationFrame` |

### 14.2 Loading States

| Context | Loading Pattern |
| :--- | :--- |
| **Table data** | Skeleton rows (5 rows of pulse `bg-slate-200`). |
| **KPI card** | Skeleton block replacing the number. |
| **Doc viewer** | 3 skeleton lines (variable width) simulating text. |
| **Submitting** | Spinner replaces button text; button disabled. |
| **Pulse** | 3 skeleton rows (avatar circle + two text lines). |

### 14.3 Empty States

Empty states are friendly and action-oriented. Each tells the user what to do next.

| Screen | Empty State Message | CTA |
| :--- | :--- | :--- |
| **SOP Library** | 'No SOPs in this department yet.' | [Upload First SOP] |
| **PM Planner** | 'No equipment registered. Add your first asset.' | [Add Equipment] |
| **Pulse (Tasks)** | 'You're all caught up. Nothing needs attention.' | — |
| **QA Queue** | 'No pending approvals.' | — |
| **Calendar** | 'Nothing scheduled for this period.' | [Add Event] |

### 14.4 Form Validation Behaviour

- **Validate on blur** (not keystroke) to avoid premature errors.
- **On submit error:** scroll to first invalid field, focus it, show all messages.
- **Error style:** `text-sm`, `text-red-600`, fade-in (150ms).
- **Input state:** `border-red-500`, `ring-red-200` on focus.
- **Success:** Show a single success toast (no green borders on individual fields).

---

## SECTION 15 — Responsive Behaviour

SOP-Guard Pro is desktop-first. Mobile is a secondary concern for MVP.

| Breakpoint | Screen Width | Layout Changes |
| :--- | :--- | :--- |
| **Desktop** | `>= 1280px` | Full 3-column shell (Sidebar / Main / Pulse). |
| **Laptop** | `1024px – 1279px` | Left sidebar collapses to icon-strip (56px). |
| **Tablet** | `768px – 1023px` | Sidebar & Pulse hidden (behind menu/bell triggers). |
| **Mobile** | `< 768px` | Single column. Tables switch to card-stack layout. |

> [!NOTE]
> **DEV NOTE:** Build mobile-first using Tailwind responsive prefixes. Panels (Pulse/Sidebar) become full-screen drawers on mobile.

---

## SECTION 16 — Accessibility Baseline

Minimum standards for MVP day one.

- **Colour Contrast:** Minimum 4.5:1 ratio for all text. No mid-tones on mid-tones.
- **Focus Rings:** Visible `outline: 2px solid #00C2A8`, `outline-offset: 2px` on all interactive elements.
- **Keyboard Nav:** Logical tab order. Modals trap focus. `Esc` to close.
- **ARIA Labels:** Required for icon-only buttons. Correct `thead`/`th` for tables.
- **Form Labels:** Every input must have an associated `<label>` (no placeholder-only labeling).
- **Announcements:** `aria-live='polite'` for loading and toasts.

---

## SECTION 17 — Tailwind Configuration

### 17.1 Custom Colour Extensions

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        navy: '#0D2B55', // sidebar, headings
        blue: '#1A5EA8', // h2, links
        teal: '#00C2A8', // CTA, dividers, focus
      }
    }
  }
}
```

### 17.2 Font Family

```typescript
fontFamily: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui'],
  mono: ['Courier New', 'ui-monospace'],
}
```

### 17.3 Shadcn/UI Theming

Map CSS variables to the brand palette:

| Variable | Maps To |
| :--- | :--- |
| `--primary` | `#00C2A8` (teal-500) |
| `--primary-foreground` | `#FFFFFF` |
| `--secondary` | `#F1F5F9` (slate-100) |
| `--border` | `#CBD5E1` (slate-300) |
| `--background` | `#F8FAFC` (slate-50) |
| `--card` | `#FFFFFF` |
| `--destructive` | `#DC2626` (red-600) |

---

## Appendix — Icon Reference

All icons are from `lucide-react`.

| UI Element | Lucide Icon | Size |
| :--- | :--- | :--- |
| **SOP Library** | `FileText` | 18px |
| **PM Planner** | `Wrench` | 18px |
| **Dashboard** | `LayoutDashboard` | 18px |
| **Upload SOP** | `Upload` | 16px |
| **Approve** | `CheckCircle2` | 16px |
| **Request Changes**| `MessageSquare` | 16px |
| **Signatures** | `PenLine` | 16px |
| **Notifications** | `Bell` | 20px |
| **AI Summary** | `Sparkles` | 16px |
| **Export** | `Download` | 16px |
| **Alert/Overdue** | `AlertCircle` | 16px |
| **QR Code** | `QrCode` | 16px |
