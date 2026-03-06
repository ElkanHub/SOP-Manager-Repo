# SOP-Guard Pro — BUILD.md
> **AI Agent Instruction File** | Version 1.0
> This file is the single source of truth for building SOP-Guard Pro phase by phase.
> Read this entire file before writing a single line of code.

---

## HOW TO USE THIS FILE

This document is written for an AI coding agent. It is structured so that:

1. You read the **GROUND RULES** and **SYSTEM REFERENCE** sections once at the start.
2. You execute **one PHASE at a time** — no skipping, no partial phases.
3. At the end of every phase you run the **PHASE CHECKLIST** before moving on.
4. You never assume — if something is ambiguous, refer back to this file first.
5. When starting a new conversation/session, re-read the **CURRENT STATE** section to restore context.

**The biggest mistake an agent makes is building too much at once. Each phase is deliberately small. Resist the urge to build ahead.**

---

## GROUND RULES

These rules apply to every single phase. No exceptions.

### Code Quality
- TypeScript strict mode everywhere. No `any` types. No `// @ts-ignore`.
- Every database operation must handle the error case explicitly.
- Never leave a `TODO` comment in committed code. Either build it or don't touch it.
- All components are functional. No class components.
- Co-locate files: a component and its types live in the same folder.

### Naming Conventions
- Files: `kebab-case.tsx` for components, `camelCase.ts` for utilities and hooks.
- Components: `PascalCase`.
- Database columns: `snake_case` (Supabase/Postgres convention).
- TypeScript types/interfaces: `PascalCase` prefixed with the domain (e.g. `SopRecord`, `PmTask`).
- Zustand stores: `use[Name]Store` (e.g. `useSopStore`).
- React Query keys: string arrays, e.g. `['sops', deptId]`.

### Styling Rules
- Tailwind utility classes only. No inline styles. No CSS modules.
- Never use arbitrary values `[123px]` unless absolutely unavoidable — use the spacing scale.
- Follow the design token system defined in the UI Spec exactly. Do not invent new colours.
- All colours reference the brand palette: `brand-navy`, `brand-blue`, `brand-teal`, or Tailwind semantic colours.
- The app is **light mode only** for MVP.

### Supabase Rules
- All database queries go through the typed Supabase client — never raw SQL strings in components.
- Row Level Security (RLS) is the security layer. Never trust the frontend for access control.
- Every table has RLS enabled. Every policy is documented in the migration file.
- Use Supabase Auth for all authentication. Never roll your own auth.

### Component Rules
- Build shared components in `/components/ui/` before building pages.
- Every shared component must have a defined props interface.
- Use Shadcn/UI as the base. Customise via the `cn()` utility and Tailwind — not by editing Shadcn source files.
- Loading, empty, and error states are required for every data-fetching component. Not optional.

### Git Discipline
- Leave all comits after each phase for the developer to review and push.
- One commit per phase minimum. Commit message format: `phase-[N]: [short description]`
- Never commit `.env` files. Use `.env.local` and ensure it is in `.gitignore`.

---

## SYSTEM REFERENCE

Read this section to understand the system you are building. Do not skip it.

### What Is SOP-Guard Pro?
An industrial/corporate SaaS platform for managing Standard Operating Procedures (SOPs) and Preventive Maintenance (PM). It has three user roles, a QA-gated document approval system, a real-time notification sidebar (The Pulse), a company calendar, and an AI-powered delta summary engine.

### The One Sentence Architecture
> A Next.js 15 app backed by Supabase (PostgreSQL + Auth + Realtime + Storage), styled with Tailwind + Shadcn/UI, with Google Gemini 3 Flash for AI features — built on a tree-node data model where every resource (SOP, equipment, event) belongs to a department node.

### User Roles (The Three Tiers)
| Role | What They Can Do |
|------|-----------------|
| **Admin** | Full system access. Manages departments, users, modules. Sees all audit logs. |
| **Manager** | Signs change controls. Manages PM schedules. Views department data. Submits SOPs. |
| **Worker** | Reads active SOPs. Completes PM tasks. Submits SOPs for approval. Sends notices. |
| **QA Manager** | A Manager in the QA department. Has global visibility across ALL departments. The sole approval authority for all SOPs and equipment additions. |

> **Critical:** "Manager" is an app-level role, not a job title. It means the user participates in the digital signature/approval chain. Workers cannot sign change controls.

### The QA Principle (Read This Twice)
All SOPs — regardless of which department writes them — must be approved by QA before going Active. QA is not just a department, it is the governance layer of the entire system. No document becomes Active without QA sign-off. This applies to equipment additions too.

### The Gold Rule
Workers only ever see **Active** SOPs. Draft, Pending, and Superseded states are invisible to Workers. Enforce this at the RLS level — not just the UI level.

### No In-App Editor
There is **no rich-text editor** in this app. Users write SOPs in Microsoft Word externally, then upload the `.docx` file. The app renders it as a read-only viewer using `mammoth.js`. All "editing" is: download the file → edit in Word → re-upload.

### The Pulse
A fixed right-side panel (300px) showing real-time personalised tasks, approvals, notices, and to-dos. It is powered by **Supabase Realtime**. It never unmounts. It is part of the global shell layout.

### Tech Stack (Locked — Do Not Deviate)
```
Framework:    Next.js 15 (App Router)
Language:     TypeScript (strict)
Database:     Supabase (PostgreSQL)
Auth:         Supabase Auth
Realtime:     Supabase Realtime
Storage:      Supabase Storage
AI:           Google Gemini 3 Flash API
Styling:      Tailwind CSS + Shadcn/UI
Tables:       TanStack Table v8
Forms:        React Hook Form + Zod
State:        Zustand (global) + TanStack Query (server state)
Icons:        Lucide React (only — no other icon libraries)
Diff:         diff-match-patch (for Change Control diff viewer)
Docx render:  mammoth.js (client-side .docx to HTML)
Hosting:      Vercel
```

### Colour Tokens (Memorise These)
```
brand-navy:   #0D2B55   sidebar bg, page headings
brand-blue:   #1A5EA8   h2 headings, links
brand-teal:   #00C2A8   CTA buttons, focus rings, dividers
slate-50:     #F8FAFC   page background
slate-100:    #F1F5F9   alternate rows, card bg
slate-800:    #1E293B   primary body text
red-600:      #DC2626   overdue, pending approvals, errors
amber-600:    #D97706   warnings, draft status
green-600:    #059669   active, approved, complete
```

### Directory Structure (Build This Exactly)
```
/app
  /(auth)
    /login
    /signup
    /onboarding
  /(dashboard)
    /layout.tsx           ← shell layout: topnav + sidebar + pulse + main
    /page.tsx             ← redirects to /dashboard
    /dashboard/page.tsx
    /sops/page.tsx
    /sops/[id]/page.tsx
    /equipment/page.tsx
    /calendar/page.tsx
    /reports/page.tsx
    /settings/page.tsx
    /qa
      /approvals/page.tsx
      /change-control/[id]/page.tsx
/components
  /ui                     ← shared components (StatusBadge, KpiCard, DataTable etc.)
  /layout                 ← TopNav, Sidebar, Pulse
  /sops                   ← SOP-specific components
  /equipment              ← PM/Equipment-specific components
  /calendar               ← Calendar components
  /notices                ← Notice composer and display
/lib
  /supabase               ← client.ts, server.ts, middleware.ts
  /gemini                 ← gemini.ts (AI utilities)
  /utils                  ← cn.ts, formatters.ts, date.ts
/hooks                    ← useRealtime.ts, usePulse.ts, useAuth.ts etc.
/types                    ← database.types.ts (generated), app.types.ts
/supabase
  /migrations             ← all .sql migration files
```

---

## COMPONENT SOURCING GUIDE

Before building any UI component, check this guide first. Three external libraries are approved for this project. They sit **on top of** the UI Spec — they are the implementation source for the shells and animations the spec describes. They do not override the spec. Every installed component must be customised to match the spec's tokens exactly.

### The Golden Rule of Sourcing
> The UI Spec defines **what to build and how it must look**. These libraries define **where to get the starting shell**. If a library component's defaults conflict with the spec (wrong colours, wrong spacing, wrong typography) — the spec wins. Always.

---

### Library 1 — Shadcn/UI Blocks
Pre-built full-page layout starters. Install with one command, get complete customisable code. These replace building the shell and auth screens from scratch.

| Spec Component | Shadcn Block | Install Command | Phase |
|---|---|---|---|
| Shell layout — AppSidebar + SiteHeader | `dashboard-01` | `npx shadcn@latest add dashboard-01` | 3 |
| Login page — two-panel branded layout | `login-02` | `npx shadcn@latest add login-02` | 2 |
| Signup / onboarding card | `signup-02` | `npx shadcn@latest add signup-02` | 2 |

**How to use Shadcn blocks correctly:**
- Install the block → it generates component files in your project
- Read the generated code before touching it — understand what it gives you
- Remap all colours to brand tokens: replace any default `blue-600` → `brand-teal`, default greys → the spec's slate palette
- The `dashboard-01` block includes a `SidebarProvider` system — use it. It handles collapsing, keyboard shortcuts (`Cmd+B`), and responsive behaviour out of the box. Do not rebuild sidebar toggle logic manually.
- The `dashboard-01` block's `SectionCards` component is the base for `<KpiCard />` — extend it, don't replace it
- `login-02` gives the two-panel layout (branded left + form right) exactly as the spec describes. Wire the form to Supabase Auth
- `signup-02` gives the centred card layout — use it as the wrapper for each onboarding step

---

### Library 2 — Magic UI
Animated components built on top of Shadcn/UI and Motion. Purely additive — adds motion to what Shadcn already provides. Install individual components as needed.

| Spec Component / Behaviour | Magic UI Component | Install Command | Phase |
|---|---|---|---|
| KPI card number count-up (replaces manual RAF approach in spec) | `NumberTicker` | `npx magicui add number-ticker` | 9 |
| Pulse new-item slide-in animation | `AnimatedList` | `npx magicui add animated-list` | 3 |
| Primary CTA buttons — Sign, Approve, Submit | `ShimmerButton` | `npx magicui add shimmer-button` | 3 |
| Active Change Control card highlight | `BorderBeam` | `npx magicui add border-beam` | 6 |

**How to use Magic UI correctly:**
- Magic UI components accept `className` — always pass your token classes to override their defaults
- `NumberTicker` replaces the `requestAnimationFrame` count-up described in the UI Spec Section 14. The spec's 600ms / ease-out spec still applies — pass `duration={0.6}` to match
- `AnimatedList` wraps the Pulse items list. Each child animates in when added. The spec's 200ms slide-down + fade behaviour is the target — check the component's default timing and adjust if needed
- `ShimmerButton` is for high-emphasis actions only: Sign, Approve, Submit Edit, Send Notice. Do not use for secondary or destructive actions
- `BorderBeam` goes on the Change Control card when status is `pending` — removes itself when `complete`
- Never use Magic UI components for decorative purposes — every animation must serve a functional signal

---

### Library 3 — 21st.dev
A community registry of React components built on Shadcn/UI and Radix. Not an npm package — you browse the registry, find a component, copy the install prompt into your AI IDE (Cursor / Windsurf), and it installs and wires automatically.

**When to use 21st.dev:**
Check 21st.dev **before building any custom component from scratch**. It is most useful for patterns that Shadcn core does not cover:

| Look here for... |
|---|
| File upload drag-and-drop zones (SOP upload, avatar upload, signature upload) |
| Diff viewer card layouts |
| Notification badge patterns |
| Approval thread / comment thread UI |
| Step progress indicators (onboarding wizard) |
| Signature pad wrappers |
| Command palette / search overlay patterns |

**How to use 21st.dev correctly:**
- Browse at `https://21st.dev` — search by component type
- When you find something suitable, copy the provided prompt and paste into your AI IDE
- After install, immediately remap all colours and spacing to the spec's token system
- If nothing on 21st.dev matches closely enough, build the component yourself following the spec — do not force a bad fit

---

### Sourcing Decision Tree

When you need to build a component, follow this order:

```
1. Is it a full-page shell or auth layout?
   → Use the Shadcn block (dashboard-01 / login-02 / signup-02)

2. Does it need animation (count-up, slide-in, shimmer, beam)?
   → Use the Magic UI component

3. Is it a complex interaction pattern not in Shadcn core?
   → Check 21st.dev first

4. Nothing fits well enough?
   → Build it yourself, following the UI Spec exactly
```

**Never install a library outside this approved set without explicit approval. Check the existing stack first.**

---

## DATABASE SCHEMA REFERENCE

This is the complete schema. Build migrations in this exact order. Every table must have RLS enabled.

### Core Tables

**profiles** (extends Supabase auth.users)
```sql
id              uuid        PK, references auth.users
full_name       text        NOT NULL
email           text        NOT NULL
job_title       text
employee_id     text
phone           text
avatar_url      text
signature_url   text        ← stored in Supabase Storage
role            text        NOT NULL  CHECK (role IN ('admin','manager','worker'))
dept_id         uuid        references departments
created_at      timestamptz DEFAULT now()
```

**departments**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
name            text        NOT NULL UNIQUE
slug            text        NOT NULL UNIQUE
is_qa           boolean     DEFAULT false
created_at      timestamptz DEFAULT now()
```

**sops**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
sop_number      text        NOT NULL UNIQUE   ← e.g. 'SOP-084'
title           text        NOT NULL
dept_id         uuid        references departments NOT NULL
version         text        NOT NULL DEFAULT 'v1.0'
status          text        NOT NULL DEFAULT 'pending_qa'
                            CHECK (status IN ('draft','pending_qa','active','superseded'))
file_url        text        ← Supabase Storage path of current .docx
date_listed     date        DEFAULT CURRENT_DATE
date_revised    date
due_for_revision date
submitted_by    uuid        references profiles
approved_by     uuid        references profiles
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

**sop_versions**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
sop_id          uuid        references sops NOT NULL
version         text        NOT NULL
file_url        text        NOT NULL
diff_json       jsonb       ← pre-computed diff against previous version
delta_summary   text        ← Gemini-generated summary
uploaded_by     uuid        references profiles
created_at      timestamptz DEFAULT now()
```

**sop_approval_requests**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
sop_id          uuid        references sops NOT NULL
submitted_by    uuid        references profiles NOT NULL
type            text        NOT NULL CHECK (type IN ('new','update'))
status          text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','changes_requested','approved','rejected'))
notes_to_qa     text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

**sop_approval_comments**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
request_id      uuid        references sop_approval_requests NOT NULL
author_id       uuid        references profiles NOT NULL
comment         text        NOT NULL
action          text        CHECK (action IN ('comment','changes_requested','approved','resubmitted'))
created_at      timestamptz DEFAULT now()
```

**sop_acknowledgements**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
sop_id          uuid        references sops NOT NULL
user_id         uuid        references profiles NOT NULL
version         text        NOT NULL
acknowledged_at timestamptz DEFAULT now()
UNIQUE (sop_id, user_id, version)
```

**change_controls**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
sop_id          uuid        references sops NOT NULL
old_version     text        NOT NULL
new_version     text        NOT NULL
old_file_url    text        NOT NULL
new_file_url    text        NOT NULL
diff_json       jsonb
delta_summary   text
status          text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','complete'))
issued_by       uuid        references profiles
created_at      timestamptz DEFAULT now()
completed_at    timestamptz
```

**signature_certificates**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
change_control_id uuid      references change_controls NOT NULL
user_id         uuid        references profiles NOT NULL
signature_url   text        NOT NULL
ip_address      text
signed_at       timestamptz DEFAULT now()
UNIQUE (change_control_id, user_id)
```

**equipment**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
asset_id        text        NOT NULL UNIQUE   ← e.g. 'ASSET-001'
name            text        NOT NULL
dept_id         uuid        references departments NOT NULL
serial_number   text
model           text
photo_url       text
linked_sop_id   uuid        references sops
frequency       text        CHECK (frequency IN ('daily','weekly','monthly','quarterly','custom'))
custom_interval_days int
last_serviced   date
next_due        date        ← computed: last_serviced + interval
status          text        DEFAULT 'pending_qa'
                            CHECK (status IN ('pending_qa','active','inactive'))
submitted_by    uuid        references profiles
approved_by     uuid        references profiles
created_at      timestamptz DEFAULT now()
```

**pm_tasks**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
equipment_id    uuid        references equipment NOT NULL
assigned_dept   uuid        references departments NOT NULL
due_date        date        NOT NULL
status          text        DEFAULT 'pending'
                            CHECK (status IN ('pending','complete','overdue'))
completed_by    uuid        references profiles
completed_at    timestamptz
notes           text
photo_url       text
created_at      timestamptz DEFAULT now()
```

**notices**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
author_id       uuid        references profiles NOT NULL
subject         text        NOT NULL
message         text        NOT NULL
audience        text        NOT NULL CHECK (audience IN ('everyone','department','individuals'))
dept_id         uuid        references departments  ← set if audience='department'
created_at      timestamptz DEFAULT now()
deleted_at      timestamptz ← soft delete
```

**notice_recipients**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
notice_id       uuid        references notices NOT NULL
user_id         uuid        references profiles NOT NULL
```

**notice_acknowledgements**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
notice_id       uuid        references notices NOT NULL
user_id         uuid        references profiles NOT NULL
acknowledged_at timestamptz DEFAULT now()
UNIQUE (notice_id, user_id)
```

**events** (Company Calendar)
```sql
id              uuid        PK DEFAULT gen_random_uuid()
title           text        NOT NULL
description     text
start_date      date        NOT NULL
end_date        date
start_time      time
end_time        time
visibility      text        NOT NULL DEFAULT 'dept'
                            CHECK (visibility IN ('public','dept'))
dept_id         uuid        references departments  ← null if public
event_type      text        DEFAULT 'manual'
                            CHECK (event_type IN ('manual','pm_auto'))
equipment_id    uuid        references equipment  ← set if event_type='pm_auto'
created_by      uuid        references profiles
created_at      timestamptz DEFAULT now()
```

**audit_log**
```sql
id              uuid        PK DEFAULT gen_random_uuid()
actor_id        uuid        references profiles
action          text        NOT NULL
entity_type     text        NOT NULL  ← 'sop', 'equipment', 'notice', 'pm_task', etc.
entity_id       uuid
dept_id         uuid        references departments
metadata        jsonb       ← any extra context
created_at      timestamptz DEFAULT now()
```

---

## RLS POLICY SUMMARY

Apply these policies to every table. Every policy is a Supabase RLS policy.

| Table | Read | Insert | Update | Delete |
|-------|------|--------|--------|--------|
| profiles | Own row + Admin | Auth users (own) | Own row + Admin | Admin |
| departments | All auth users | Admin | Admin | Admin |
| sops (active) | All auth users | Manager/Worker own dept OR QA | Manager own dept OR QA | Admin |
| sops (non-active) | Own dept Manager + QA + Admin | — | — | — |
| sop_approval_requests | Submitter + QA + Admin | Auth users | QA + Admin | — |
| change_controls | Own dept Manager + QA + Admin | QA + Admin | QA + Admin | — |
| signature_certificates | Own dept Manager + QA | Manager (own signature) | — | — |
| equipment (active) | All auth users | Any dept (pending_qa) | QA (approve) + own dept | Admin |
| pm_tasks | Own dept + QA + Admin | System/Manager | Own completion | — |
| notices | Recipients + author + Admin | Auth users | Author (soft delete) | — |
| events | Public: all / Dept: own dept + QA | Auth users | Creator + Admin | Creator + Admin |
| audit_log | QA + Admin | System (service role) | — | — |

> **Implement RLS policies in the migration files. Test every policy with both allowed and blocked user scenarios before moving to the next phase.**

---

## PHASE-BY-PHASE BUILD PLAN

---

### PHASE 0 — Project Bootstrap
**Goal:** Working Next.js project connected to Supabase with the correct folder structure and token system in place. No UI. No features. Just the foundation.

**Steps:**
1. Create Next.js 15 project: `npx create-next-app@latest sop-guard-pro --typescript --tailwind --eslint --app --src-dir=false`
2. Install all dependencies in one command:
```bash
npm install @supabase/supabase-js @supabase/ssr zustand @tanstack/react-query @tanstack/react-table react-hook-form zod lucide-react mammoth diff-match-patch @google/generative-ai date-fns
```
3. Install Shadcn/UI: `npx shadcn@latest init` — choose: TypeScript, Default style, slate base colour, CSS variables yes.
4. Install Shadcn components needed for MVP:
```bash
npx shadcn@latest add button input label textarea select dialog sheet dropdown-menu table badge tabs avatar toast card separator
```
5. Install the three Shadcn blocks (full-page layout starters — see Component Sourcing Guide):
```bash
npx shadcn@latest add dashboard-01
npx shadcn@latest add login-02
npx shadcn@latest add signup-02
```
6. Install Magic UI and the four approved components:
```bash
npx magicui add number-ticker
npx magicui add animated-list
npx magicui add shimmer-button
npx magicui add border-beam
```
> After installing each block or Magic UI component, read the generated code before using it. Understand the props and structure first. Do not assume behaviour.

> **21st.dev** has no global install. Browse `https://21st.dev` when you need a specific interaction pattern before building from scratch. Use the AI IDE prompt it provides per component. Remap all tokens to the spec immediately after install.

7. Create the full directory structure exactly as shown in the SYSTEM REFERENCE section above.
6. Create `/lib/utils/cn.ts` with the `cn()` helper (clsx + tailwind-merge).
7. Configure `tailwind.config.ts` — extend colours with `brand.navy`, `brand.blue`, `brand.teal` as defined in the colour tokens.
8. Set up `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```
9. Create `/lib/supabase/client.ts` (browser client), `/lib/supabase/server.ts` (server client using cookies), and `/lib/supabase/middleware.ts` (session refresh middleware).
10. Create `middleware.ts` at root — protect all `/(dashboard)` routes. Redirect unauthenticated users to `/login`.
11. Create `/types/app.types.ts` — define TypeScript interfaces for all domain entities matching the schema (SopRecord, Department, Profile, Equipment, PmTask, Notice, CalendarEvent, ChangeControl, AuditLog).
12. Run `supabase gen types typescript` and save output to `/types/database.types.ts`.

**Phase 0 Checklist:**
- [ ] `npm run dev` runs without errors
- [ ] `npm run build` passes with no TypeScript errors
- [ ] Supabase client connects (test with a simple query in a server component)
- [ ] `/dashboard` redirects to `/login` when unauthenticated
- [ ] All directories exist as specified
- [ ] Tailwind brand tokens are available as utility classes
- [ ] No `any` types in codebase

**Commit:** `phase-0: project bootstrap, supabase setup, type system, tailwind tokens`

---

### PHASE 1 — Database Migrations
**Goal:** The complete database schema is live in Supabase with RLS policies active. No UI yet. Just the data layer.

**Steps:**
1. Create migration files in `/supabase/migrations/` in this order (one file per logical group):
   - `001_departments.sql`
   - `002_profiles.sql` — include trigger to auto-create profile on auth.users insert
   - `003_sops.sql` — sops + sop_versions + sop_approval_requests + sop_approval_comments + sop_acknowledgements
   - `004_change_controls.sql` — change_controls + signature_certificates
   - `005_equipment.sql` — equipment + pm_tasks
   - `006_notices.sql` — notices + notice_recipients + notice_acknowledgements
   - `007_calendar.sql` — events
   - `008_audit_log.sql`
   - `009_rls_policies.sql` — ALL RLS policies in one file for easy auditing
   - `010_seed_qa_department.sql` — seed the QA department row with `is_qa = true`

2. For the profiles trigger, create a Postgres function `handle_new_user()` that fires on `INSERT` to `auth.users` and creates a corresponding row in `public.profiles`.

3. Write a database function `get_user_dept_is_qa(user_id uuid) RETURNS boolean` — used in RLS policies to check if a user belongs to the QA department without a join.

4. Write a database function `calculate_next_due(last_serviced date, frequency text, custom_interval_days int) RETURNS date` — used to auto-update `equipment.next_due` after a PM task is completed.

5. Create a Supabase trigger on `pm_tasks` — when a task is marked `complete`, update the parent `equipment.last_serviced` and recalculate `equipment.next_due`, then auto-create the next `pm_tasks` row for the following cycle.

6. Push all migrations: `supabase db push`

7. Regenerate types: `supabase gen types typescript > types/database.types.ts`

**Phase 1 Checklist:**
- [ ] All 13 tables exist in Supabase dashboard
- [ ] RLS is enabled on every table (verify in Supabase dashboard)
- [ ] Profiles trigger fires correctly (test by creating a test auth user)
- [ ] QA department seed row exists with `is_qa = true`
- [ ] TypeScript types are regenerated and match the schema
- [ ] `npm run build` still passes

**Commit:** `phase-1: complete database schema, RLS policies, triggers, seed data`

---

### PHASE 2 — Authentication & Onboarding
**Goal:** A user can sign up, complete the 5-step onboarding wizard, and land on a placeholder dashboard. Login and logout work. Sessions persist across refreshes.

**Screens to build:**
- `/login` — use the installed `login-02` block as the layout base. Wire the right-panel form to Supabase Auth. Remap the left panel to `bg-brand-navy` with the SOP-Guard Pro name, tagline, and three feature callout lines as specified in UI Spec Section 4.1.
- `/signup` — use the installed `signup-02` block as the card wrapper. Wire to Supabase Auth `signUp()`. On success redirect to `/onboarding`.
- `/onboarding` — 5-step wizard. Use the `signup-02` card as the base layout for each step. Swap content per step — the card shell stays, the interior changes.

**Onboarding Steps (build as a single page with step state):**
1. **Step 1 — Account confirmation** (auto-filled from signup, user reviews)
2. **Step 2 — Department** — dropdown populated from `departments` table
3. **Step 3 — Role** — two large card toggles: Manager | Worker
4. **Step 4 — Profile Details** — Job Title (required), Employee ID, Phone, Avatar upload
5. **Step 5 — Digital Signature** — draw on canvas (use `react-signature-canvas`) OR upload PNG. Upload signature to Supabase Storage bucket `signatures/`. Store URL in `profiles.signature_url`.

**Logic:**
- On signup, create the auth user then immediately redirect to `/onboarding`.
- On each step, save progress to the `profiles` table via upsert.
- On final step completion, set a `onboarding_complete` flag (add boolean column to profiles). Redirect to `/dashboard`.
- If an authenticated user hits any `/(dashboard)` route and `onboarding_complete = false`, redirect them to `/onboarding`.
- The middleware must handle three states: unauthenticated → `/login`, authenticated + incomplete onboarding → `/onboarding`, authenticated + complete → allow through.

**Components to build:**
- `<OnboardingLayout />` — centred card, progress bar at top, step counter
- `<DepartmentSelect />` — populates from Supabase `departments` table
- `<RoleToggleCards />` — two large clickable cards with icon, label, description
- `<SignatureCanvas />` — wraps `react-signature-canvas`, exposes `getDataUrl()` and `clear()`
- `<AvatarUpload />` — drag or click to upload, circular preview, uploads to `avatars/` storage bucket

**Phase 2 Checklist:**
- [ ] Signup creates auth user AND profile row
- [ ] All 5 onboarding steps save data correctly
- [ ] Signature is stored in Supabase Storage and URL saved to profile
- [ ] Incomplete onboarding redirects correctly
- [ ] Login works, session persists on refresh
- [ ] Logout clears session and redirects to `/login`
- [ ] Admin user can be manually set via Supabase dashboard (set `role = 'admin'`)
- [ ] `npm run build` passes

**Commit:** `phase-2: auth, 5-step onboarding wizard, signature capture, session handling`

---

### PHASE 3 — Shell Layout & The Pulse (Static)
**Goal:** The authenticated shell (top nav + left sidebar + pulse) is rendered on all dashboard pages. The Pulse shows static placeholder data. Navigation between pages works. No real data yet.

**Starting point — use the `dashboard-01` block:**
The `dashboard-01` block was installed in Phase 0. It gives you `AppSidebar`, `SiteHeader`, `SidebarProvider`, `NavMain`, and `SectionCards` out of the box. Do not build the sidebar or header from scratch — adapt what the block provides.

Read the generated block files first. Then make these adaptations:
- Remap `AppSidebar` nav items to: Dashboard, SOP Library, Equipment, Calendar, Reports
- Add the "MY DEPARTMENT" / "ALL DEPARTMENTS" section logic (data-driven from `departments` table, QA-conditional)
- Remap `SiteHeader` to the spec: navy bg, logo left, search centre, bell + avatar right
- Add The Pulse as a new fixed-right panel (the block does not include this — build it alongside the block's layout)
- Remap all colours to brand tokens throughout: replace the block's default blue/grey palette with the spec's navy/teal/slate system

**Screens to build:**
- `/app/(dashboard)/layout.tsx` — the shell
- Fixed, 48px height, `bg-brand-navy`, z-50
- Left: logo text "SOP-Guard Pro" in white
- Centre: search input (static for now — wire up in Phase 7)
- Right: bell icon with unread count badge + user avatar dropdown (Profile link, Sign Out)

`<Sidebar />`
- Fixed left, 240px wide, `bg-white`, border-right `border-slate-200`
- Top section: "MY DEPARTMENT" label + user's dept name as active nav item
- QA users: additional "ALL DEPARTMENTS" section listing all dept nav items (data from `departments` table)
- Nav links: Dashboard, SOP Library, Equipment, Calendar, Reports
- Bottom: Settings link + role badge
- Active state: `bg-blue-50`, 3px left border `brand-teal`, font-semibold
- Collapsed state on `lg` breakpoint: 56px icon-only

`<ThePulse />`
- Fixed right panel, 300px wide, `bg-slate-50`, border-left `border-slate-200`
- Sections: Priority (placeholder), Today (placeholder), Notices (placeholder), To-Dos (placeholder)
- "Send Notice" button pinned to bottom
- **Wire up Supabase Realtime subscription in this phase** even though content is placeholder — the subscription architecture must be correct from the start.

`<PulseSection />` — collapsible section wrapper used inside ThePulse

**Layout behaviour:**
- Main content area: `ml-[240px] mr-[300px] mt-[48px]` — adjusts for sidebar and pulse
- On `lg` breakpoint: sidebar collapses, main content adjusts
- On `md` breakpoint: pulse hidden, bell icon in topnav shows count

**Phase 3 Checklist:**
- [ ] Shell renders on all dashboard routes without layout shift
- [ ] Sidebar shows correct department for the logged-in user
- [ ] QA users see all department tabs in sidebar
- [ ] Navigation between pages works (no full reload)
- [ ] Active route is highlighted in sidebar
- [ ] The Pulse renders (with placeholder content)
- [ ] Supabase Realtime channel is subscribed (verify in browser network tab)
- [ ] Responsive: sidebar collapses at `lg`, pulse hides at `md`
- [ ] `npm run build` passes

**Commit:** `phase-3: shell layout, topnav, sidebar, pulse panel, realtime subscription`

---

### PHASE 4 — SOP Library (Read)
**Goal:** The SOP Library page renders all SOPs from the database in a table. Users can click a SOP to open it in a tab viewer. The tab system works. Search filters the table client-side.

**Pages to build:**
- `/sops/page.tsx` — library table
- `/sops/[id]/page.tsx` — individual SOP viewer (also powers the tab system)

**Components to build:**

`<SopLibraryTable />`
- Uses `<DataTable />` (TanStack Table v8)
- Columns: SOP No., Title, Department badge, Version, Status badge, Date Listed, Due for Revision, Actions (kebab menu)
- Status badge uses `<StatusBadge />` component — build this in `/components/ui/status-badge.tsx`
- Department badge: coloured pill, colour mapped per department (store colour in `departments` table — add a `colour` column: `text DEFAULT 'blue'`)
- Rows are clickable — opens SOP in tab viewer
- Server-side data fetch via React Query: `['sops', deptId, statusFilter]`
- Filter bar above table: Status dropdown, Department dropdown (QA only), search input

`<SopTabStrip />`
- Horizontal scrollable strip of open SOP tabs
- Each tab: SOP number + truncated title + close (X) button
- Active tab: white bg, 3px bottom border `brand-teal`
- State managed in Zustand `useSopTabStore`: `openTabs: SopTab[]`, `activeTabId: string`, `openTab(sop)`, `closeTab(id)`, `setActive(id)`

`<SopViewer />`
- Renders the `.docx` file as HTML using `mammoth.js`
- Fetch the file from Supabase Storage as a `ArrayBuffer`
- Pass to `mammoth.convertToHtml()` on the client
- Apply a CSS reset + custom style map to the output HTML
- Viewer header: SOP No., Title, dept badge, version badge, status badge, Last Revised, Approved By
- Right-side action bar: Acknowledge button (Workers only, if not yet acknowledged for this version), Submit Edit button (all roles)
- Version history button opens `<SlideOver />` panel with past versions list

`<StatusBadge />` — build this as a proper reusable component, referenced throughout the app:
- Props: `status: string`, `size?: 'sm'|'md'|'lg'`
- Colour mapping as defined in the UI Spec (green=active, amber=draft, blue=pending, red=overdue, grey=superseded)

**Data rules:**
- Workers: RLS ensures they only see `status = 'active'` SOPs
- Managers/QA: can see all statuses in their department (QA sees all)
- The Acknowledge button: check `sop_acknowledgements` for `(sop_id, user_id, version)` — hide button if row exists

**Phase 4 Checklist:**
- [ ] SOP table renders real data from Supabase
- [ ] RLS: workers cannot see draft/pending SOPs (test with a worker account)
- [ ] Clicking a row opens the SOP in the tab viewer
- [ ] Multiple tabs can be open simultaneously
- [ ] Tabs close cleanly (no stale data)
- [ ] `.docx` renders as readable HTML in the viewer
- [ ] Status badges are correct colours
- [ ] Acknowledge button appears for workers on unacknowledged SOPs
- [ ] Clicking Acknowledge inserts row to `sop_acknowledgements`
- [ ] `npm run build` passes

**Commit:** `phase-4: sop library table, tab viewer, docx rendering, acknowledge flow`

---

### PHASE 5 — SOP Submission & QA Approval Flow
**Goal:** Any user can upload a new SOP or submit an edit. QA receives a notification in The Pulse. QA can approve or request changes. The approval thread persists.

**Components to build:**

`<SopUploadModal />`
- Triggered by "Upload SOP" button in library toolbar OR "Submit Edit" in viewer
- 3-step modal (use Shadcn Dialog):
  1. File upload — drag-and-drop `.docx`, show filename + size, validate file type
  2. Metadata — SOP Number, Title, Department (auto-fill or QA selects), New or Update radio, If update: existing SOP search dropdown
  3. Notes to QA — textarea, 500 char limit, Submit button
- On submit: upload file to Supabase Storage `sop-uploads/[uuid].docx`, insert row to `sop_approval_requests`, insert to `audit_log`
- Show success confirmation with "Submitted for QA review" message

`<QaApprovalPage />` — `/qa/approvals/page.tsx` (QA/Admin only — enforce in middleware)
- List of pending approval requests as cards
- Each card: requester name/avatar, dept, SOP number/title, type badge (New/Update), submission time
- Clicking a card opens the full approval view

`<QaApprovalView />` — full-page layout:
- Top header: request details (requestor, SOP, type, timestamp)
- Left (70%): SopViewer rendering the submitted file
- Right (30%): approval panel
  - Approve button (green): calls `approve_sop_request` Supabase function
  - Request Changes button (amber): reveals comment textarea + Send button
  - Thread history below: chronological list of all comments/actions for this request

**Server-side logic for approval:**
Create a Supabase database function `approve_sop_request(request_id uuid, qa_user_id uuid)` that:
1. Updates `sop_approval_requests.status = 'approved'`
2. If type = 'new': updates `sops.status = 'active'`, sets `approved_by`
3. If type = 'update': creates a new `change_controls` row and sets `sops.status = 'pending_cc'` (add this status)
4. Inserts to `audit_log`
5. Returns the result type so the frontend knows what happened next

**Pulse integration:**
- When a new `sop_approval_requests` row is inserted, the Supabase Realtime subscription in The Pulse must fire and add it to the QA member's Priority section
- The Pulse item shows: SOP number, requester name, time ago, "Review" link
- On approval/rejection, the item is removed from the Pulse

**Phase 5 Checklist:**
- [ ] Any user can upload a `.docx` and submit it
- [ ] QA receives a real-time notification in The Pulse immediately after submission
- [ ] QA approval page lists all pending requests
- [ ] QA can view the submitted document in the viewer
- [ ] QA can approve — new SOP becomes Active, update triggers Change Control
- [ ] QA can request changes with a comment — submitter sees this in their Pulse
- [ ] The approval thread shows all back-and-forth history
- [ ] Non-QA users cannot access `/qa/approvals` (test with a worker account)
- [ ] Audit log records every action
- [ ] `npm run build` passes

**Commit:** `phase-5: sop upload modal, qa approval flow, approval thread, pulse integration`

---

### PHASE 6 — Change Control Center
**Goal:** When a QA approves an SOP update, a Change Control is issued. The diff viewer and AI delta summary render. Managers receive signature requests in The Pulse. Signing works. When all signatures are collected, the new version goes Active.

**Pages to build:**
- `/qa/change-control/[id]/page.tsx`

**Components to build:**

`<ChangeControlHeader />`
- SOP name, CC reference number, issued date
- Status badge: Pending Signatures (red) or Complete (green)
- "X of Y signatures collected" counter

`<DiffViewer />`
- Two-column layout: Old version (left, red-50 bg) vs New version (right, green-50 bg)
- Changed paragraphs highlighted: red left-border + strikethrough on left, green left-border on right
- Toolbar: "Show All" / "Show Changes Only" toggle
- Uses pre-computed `diff_json` from `change_controls` table — do not re-compute on the client
- If `diff_json` is null: show a loading state and call the diff computation API route

`<DeltaSummaryCard />`
- Shows Gemini-generated `delta_summary` from `change_controls` table
- Title: "AI Summary of Changes" with Sparkles icon
- 3–5 bullet points
- Regenerate icon: calls `/api/gemini/delta-summary` route with both file URLs
- Disclaimer text below: "This summary is AI-generated. Review the full diff before signing."

`<SignatureGrid />`
- Lists all required signatories with their status
- Each row: avatar initials, name, role, dept, status badge (Signed / Pending)
- If signed: green badge + "Signed [timestamp]"
- "Sign" button: only visible to current user if they are a required signatory and have not signed
- On click: opens `<SignatureConfirmModal />`

`<SignatureConfirmModal />`
- Shows: "You are signing off on [SOP title] version [X]"
- Displays the user's stored signature image (`profiles.signature_url`)
- "Confirm & Sign" button (green): inserts row to `signature_certificates` with IP (get from API route), signed_at, signature_url
- After all required signatures: database trigger updates `change_controls.status = 'complete'`, sets `sops.status = 'active'` for the new version, archives the old version as `superseded`

**Gemini integration — `/api/gemini/delta-summary` route:**
```typescript
// POST /api/gemini/delta-summary
// Body: { changeControlId: string }
// 1. Fetch old_file_url and new_file_url from change_controls
// 2. Download both .docx files from Supabase Storage
// 3. Convert both to plain text using mammoth
// 4. Send to Gemini with the prompt:
//    "Compare these two versions of a Standard Operating Procedure.
//     Summarise in 3-5 bullet points what has substantively changed.
//     Be specific. Focus on procedural changes, not formatting.
//     Old version: [text]. New version: [text]."
// 5. Store result in change_controls.delta_summary
// 6. Return the summary
```

**Pulse integration:**
- When a `change_controls` row is created, all required Managers receive a Pulse notification: "Change Control issued for [SOP title]. Your signature is required."
- When a Manager signs, remove their pending item from the Pulse
- When all signatures collected: all signatories get a Pulse notification: "[SOP title] v[X] is now Active."

**Phase 6 Checklist:**
- [ ] Change Control page renders for a real CC record
- [ ] Diff viewer shows old vs new with correct red/green highlighting
- [ ] AI delta summary is generated and displayed
- [ ] Signature grid shows correct signatories
- [ ] Signing works — inserts to `signature_certificates` with all required fields including IP
- [ ] After final signature: SOP status updates to Active, old version archived
- [ ] Managers receive Pulse notifications for pending signatures
- [ ] Non-manager users cannot access the Change Control signing page
- [ ] `npm run build` passes

**Commit:** `phase-6: change control page, diff viewer, gemini delta summary, signature flow`

---

### PHASE 7 — PM Planner & Equipment Registry
**Goal:** Equipment can be submitted and approved by QA. PM schedules generate tasks. Workers are alerted on due dates. Completion is logged.

**Pages to build:**
- `/equipment/page.tsx`

**Components to build:**

`<EquipmentTable />`
- TanStack table with columns: Asset ID, Name, Dept badge, Linked SOP, Frequency badge, Last Serviced, Next Due, Status badge, Actions
- Next Due: red+bold if overdue, amber if within 7 days, green otherwise
- "Add Equipment" button opens `<AddEquipmentModal />`

`<AddEquipmentModal />`
- Fields: Asset Name, Department (auto-fill / QA selects), Serial Number, Model, Photo upload, Linked SOP (search dropdown), Maintenance Frequency (radio: Daily/Weekly/Monthly/Quarterly), Last Service Date
- On submit: inserts to `equipment` with `status = 'pending_qa'`, notifies QA via Pulse

`<AssetDetailSheet />`
- SlideOver panel (480px wide) triggered by clicking an asset row
- Top: asset name, ID, dept badge, status badge, QR code SVG
- Details section: serial, model, photo, SOP link, frequency
- Service History: scrollable list of completed PM tasks (completed_by, date, notes, photo)
- "Log PM Completion" button (Workers + Managers in assigned dept)

`<PmCompletionModal />`
- Fields: Completion notes (optional), Photo upload (optional), Confirm button
- On submit: updates `pm_tasks.status = 'complete'`, sets `completed_by`, `completed_at`. Triggers DB function that updates equipment and creates next PM task row.

**Calendar auto-population:**
When a PM task row is created (by the trigger), also create an `events` row with `event_type = 'pm_auto'` and the due date. This keeps the calendar in sync automatically.

**Pulse integration for PM:**
Create a scheduled job (Supabase pg_cron or a Next.js cron route called daily by Vercel Cron):
- Every day at 07:00, query all `pm_tasks` where `due_date = today` and `status = 'pending'`
- For each, insert a notice into The Pulse for all Workers in `assigned_dept`
- Also update tasks to `overdue` status if `due_date < today` and still `pending`

**Phase 7 Checklist:**
- [ ] Equipment table shows all approved assets
- [ ] Workers cannot see `pending_qa` assets in other departments
- [ ] QA receives Pulse notification when equipment is submitted
- [ ] QA can approve equipment (status → active)
- [ ] Asset Detail Sheet renders with service history
- [ ] PM completion logs correctly and triggers next task creation
- [ ] PM due dates auto-populate the calendar
- [ ] Workers receive Pulse alerts on PM due dates
- [ ] `npm run build` passes

**Commit:** `phase-7: equipment registry, pm planner, pm completion flow, calendar auto-population`

---

### PHASE 8 — Company Calendar & Notice System
**Goal:** The Company Calendar shows all events. Users can create public or dept-scoped events. The Notice system is fully functional with delivery, acknowledgement, and deletion.

**Pages to build:**
- `/calendar/page.tsx`

**Components to build:**

`<CompanyCalendar />`
- Monthly grid view (build from scratch with `date-fns` — do not use a full calendar library for MVP)
- Each day cell: up to 3 event chips, "+N more" overflow link
- Event chip colours: blue = public event, purple = dept event, teal = PM auto, red = overdue PM
- Today: teal ring around date number
- Prev/next month navigation
- "Week" view toggle (optional for MVP — skip if scope creep)
- Upcoming events sidebar (next 7 days as a list)

`<NewEventModal />`
- Fields: Title, Date (date picker), Time (optional), Description (optional), Visibility (Public / My Department toggle)
- On submit: inserts to `events` table, revalidates calendar query

`<NoticeComposer />` — triggered by "Send Notice" button in The Pulse
- Opens as a Dialog (Shadcn)
- Fields: To (audience: Everyone / Department / Individuals search), Subject (80 char), Message (500 char with counter)
- On submit: inserts to `notices` + `notice_recipients` (if individuals), broadcasts via Supabase Realtime channel `notices:[audience]`

**Pulse — Notice display:**
- Each notice: sender avatar + name, subject bold, message preview, timestamp, audience label
- Acknowledged button: initial state slate-100, on click: green-100 + checkmark, inserts to `notice_acknowledgements`
- Author view: "X of Y recipients acknowledged" + progress bar
- Delete button (trash icon, author only): sets `notices.deleted_at`, removes from all Pulse panels via Realtime broadcast

**Realtime for Notices:**
```typescript
// In usePulse hook:
const channel = supabase.channel('notices')
  .on('broadcast', { event: 'new-notice' }, (payload) => {
    // add to pulse notices list
  })
  .on('broadcast', { event: 'notice-deleted' }, (payload) => {
    // remove from pulse notices list
  })
  .subscribe()
```

**Phase 8 Checklist:**
- [ ] Calendar renders all event types with correct colours
- [ ] PM events auto-appear (from Phase 7 trigger)
- [ ] New event modal creates events correctly
- [ ] Public events visible to all users; dept events visible to own dept only (verify with RLS)
- [ ] Notice composer sends to correct audience
- [ ] Notices appear in The Pulse in real-time for recipients (test with two browser tabs)
- [ ] Acknowledge button works and author sees the count update
- [ ] Author can delete notice — it disappears from all recipients' Pulse in real-time
- [ ] `npm run build` passes

**Commit:** `phase-8: company calendar, new event flow, notice composer, notice acknowledgement, realtime delivery`

---

### PHASE 9 — Dashboard & KPI Widgets
**Goal:** The dashboard shows real data. KPIs reflect live counts. The activity feed shows real audit log entries. The dashboard adapts based on user role.

**Components to build:**

`<KpiCard />` — build as a proper reusable component:
- Props: `title`, `value`, `icon` (Lucide), `colorScheme` ('blue'|'red'|'green'|'amber'), `onClick?`
- Use the installed **Magic UI `NumberTicker`** for the count-up animation — pass `duration={0.6}` to match the spec's 600ms target. Do not build a manual `requestAnimationFrame` loop.
- Colour scheme drives: bg token, icon colour
- The `dashboard-01` block's `SectionCards` is the structural base — extend it with the above props rather than building the card layout from scratch

**KPI data queries (use React Query, parallel fetches):**
```typescript
// Dashboard server component fetches all in parallel:
const [activeSops, pendingApprovals, pmCompliance, dueSops] = await Promise.all([
  supabase.from('sops').select('id', { count: 'exact' }).eq('status', 'active').eq('dept_id', user.dept_id),
  supabase.from('sop_approval_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
  // pm compliance: count(complete this month) / count(due this month) * 100
  supabase.rpc('get_pm_compliance', { dept_id: user.dept_id }),
  supabase.from('sops').select('id', { count: 'exact' }).lte('due_for_revision', new Date().toISOString()).eq('status', 'active'),
])
```

`<ActivityFeed />` — scrollable list:
- Query `audit_log` ordered by `created_at DESC`, limit 10, filtered by `dept_id`
- Format each entry as: "[Actor name] [action] [entity_name] — [relative time]"
- Join with `profiles` for actor name/initials
- Supabase Realtime: subscribe to `audit_log` inserts for the current dept — new entries animate into the top of the list

`<UpcomingPmList />` — next 5 PM due dates:
- Query `pm_tasks` where `status = 'pending'` and `assigned_dept = user.dept_id`, ordered by `due_date ASC`, limit 5
- Show: asset name, due date, urgency colour (red=overdue, amber=≤7 days, green=OK)

**Phase 9 Checklist:**
- [ ] All 4 KPI cards show real counts
- [ ] KPI colours change based on values (red pending, green compliance, etc.)
- [ ] KPI click navigates to the correct filtered page
- [ ] Activity feed shows real audit log entries
- [ ] Upcoming PM list shows correct data
- [ ] Dashboard adapts for role: QA sees global counts, others see dept-scoped counts
- [ ] New audit log entries appear in the feed in real-time
- [ ] `npm run build` passes

**Commit:** `phase-9: dashboard kpi widgets, activity feed, upcoming pm, role-adaptive views`

---

### PHASE 10 — Reports & Audit Logs
**Goal:** The Reports page renders all 5 report types with real data. Export to CSV works.

**Pages to build:**
- `/reports/page.tsx`

**Report types to implement:**
1. **SOP Change History** — query `sop_approval_comments` + `change_controls` + `signature_certificates`, joined. Columns: SOP No., Action, Actor, Timestamp, Version.
2. **Worker Acknowledgement Log** — query `sop_acknowledgements` + `profiles` + `sops`. Columns: Worker, SOP No., Title, Version, Acknowledged At.
3. **PM Completion Log** — query `pm_tasks` + `equipment` + `profiles`. Columns: Asset, Dept, Due Date, Completed By, Completed At, Status.
4. **Notice Log** — query `notices` + `notice_acknowledgements`. Columns: Subject, Author, Audience, Sent At, Ack Count.
5. **AI Risk Insights** — call `/api/gemini/risk-insights` which aggregates overdue SOPs, missed PMs, and low acknowledgement rates, then sends a summary prompt to Gemini. Render as a card with risk level badge and bullet points.

**CSV Export:**
- Build a `exportToCsv(data: Record<string, unknown>[], filename: string)` utility in `/lib/utils/export.ts`
- Each report table has an "Export CSV" button in its toolbar

**Filter bar (shared across all reports):**
- Date range picker (start date + end date inputs)
- Department dropdown (QA/Admin see all, others see own dept)
- Status filter (where applicable)

**Phase 10 Checklist:**
- [ ] All 5 reports render real data
- [ ] Filters work and update the table correctly
- [ ] CSV export downloads a valid file for each report
- [ ] AI Risk Insights card renders Gemini output
- [ ] Non-QA users cannot see data from other departments in reports (verify with RLS)
- [ ] `npm run build` passes

**Commit:** `phase-10: reports page, all report types, csv export, ai risk insights`

---

### PHASE 11 — Settings & Admin
**Goal:** Admin can manage departments and user roles. All users can update their profile and notification preferences.

**Pages to build:**
- `/settings/page.tsx` — tabbed layout: Profile | Notifications | (Admin only) Departments | (Admin only) Users

**Components/features to build:**

`<ProfileSettings />`
- Edit: Full Name, Job Title, Employee ID, Phone, Avatar
- Re-sign signature: renders current signature, "Re-draw" button opens `<SignatureCanvas />`

`<NotificationPrefs />`
- Toggles: Email notifications (on/off), In-app Pulse notifications (on/off)
- These are stored as JSON in `profiles.notification_prefs jsonb`

`<DepartmentManager />` (Admin only)
- Table of departments: Name, Slug, Is QA, Created At
- "Add Department" button: simple modal with Name input
- Inline edit of department colour (for badges)

`<UserManager />` (Admin only)
- Table of all users: Name, Email, Dept, Role, Onboarding Complete, Joined
- Role change dropdown (Admin can promote/demote between manager/worker)
- Cannot change own role

**Phase 11 Checklist:**
- [ ] Users can update profile details
- [ ] Signature re-draw saves correctly
- [ ] Non-admin users cannot see Departments or Users tabs (enforce in UI and server)
- [ ] Admin can add a new department (appears in sidebar for users in that dept)
- [ ] Admin can change a user's role
- [ ] `npm run build` passes

**Commit:** `phase-11: settings page, profile edit, signature re-draw, admin department and user management`

---

### PHASE 12 — Polish, Performance & Launch Prep
**Goal:** The app is production-ready. All loading states, empty states, and error states are implemented. Performance is acceptable. The app deploys cleanly to Vercel.

**Tasks:**

**Loading & Empty States:**
- Every data-fetching component has a skeleton loader (animated pulse bg-slate-200)
- Every list/table has a designed empty state (icon + message + CTA where applicable)
- Page-level Suspense boundaries with skeleton layouts

**Error Handling:**
- Wrap all server components in `error.tsx` boundaries
- All Supabase query errors are caught and shown as inline error states (not toast-only)
- Auth errors redirect to `/login` cleanly

**Performance:**
- All images use `next/image`
- Heavy components (DiffViewer, SopViewer) are lazy-loaded with `dynamic(() => import(...), { ssr: false })`
- The Gemini API calls are debounced and cached using React Query with `staleTime: 5 * 60 * 1000`
- All Supabase queries in server components use `cache: 'no-store'` or React cache() appropriately

**Accessibility baseline:**
- All icon-only buttons have `aria-label`
- All modals trap focus and close on Escape
- All inputs have associated `<label>` elements
- Focus rings visible on all interactive elements (use `ring-brand-teal`)

**Vercel Deployment:**
- Set all environment variables in Vercel dashboard
- Set Supabase's allowed redirect URLs to include the production domain
- Enable Vercel Cron for the daily PM alert job
- Run `npm run build` and verify zero errors before deploying

**Final Checks:**
- [ ] Sign up → onboarding → dashboard flow works end-to-end in production
- [ ] QA approval flow works end-to-end
- [ ] Change Control with Gemini summary works
- [ ] PM task completion and next-task creation works
- [ ] Notice delivery is real-time in production
- [ ] All pages render correctly on 1280px, 1024px, 768px viewports
- [ ] Lighthouse Performance score > 80 on dashboard page
- [ ] No console errors in production build
- [ ] All environment variables are set in Vercel
- [ ] `npm run build` passes with zero errors and zero TypeScript warnings

**Commit:** `phase-12: loading states, empty states, error boundaries, perf optimisation, accessibility, vercel deployment`

---

## CURRENT STATE

> **Update this section at the end of every phase.**
> When starting a new session, read this section first to restore context.

```
Last completed phase: NONE
Current phase:        PHASE 0 — Project Bootstrap
Blockers:             None
Notes:                —
Supabase project URL: [fill in]
Vercel project URL:   [fill in]
```

---

## QUICK REFERENCE — THINGS TO NEVER DO

| Never Do This | Do This Instead |
|---------------|-----------------|
| Use `any` TypeScript type | Define a proper type in `/types/app.types.ts` |
| Fetch data in a client component without React Query | Use `useQuery` with a proper query key |
| Put business logic in a component | Extract to a hook or server action |
| Hard-code department names or IDs | Query from `departments` table |
| Bypass RLS with service role key on the client | Service role key is server-only |
| Use `window.localStorage` for auth state | Use Supabase session via `@supabase/ssr` |
| Install a new library without checking if Supabase/Shadcn already covers it | Check existing stack first |
| Write the diff computation on the client | Pre-compute server-side, store in DB |
| Use `react-calendar` or `react-big-calendar` | Build the calendar with `date-fns` as specified |
| Mix icon libraries | Lucide React only |
| Hardcode colour hex values | Use Tailwind token classes |
| Skip the phase checklist | Run every checklist item before committing |
| Build the shell layout or auth screens from scratch | Use the installed Shadcn blocks: `dashboard-01`, `login-02`, `signup-02` |
| Write a manual `requestAnimationFrame` count-up loop | Use Magic UI `NumberTicker` with `duration={0.6}` |
| Build a Pulse list animation manually | Use Magic UI `AnimatedList` |
| Use Magic UI `ShimmerButton` on secondary or destructive actions | Reserve shimmer for high-emphasis actions only: Sign, Approve, Submit |
| Let an installed block's default colours override the spec | Remap every installed component to brand tokens immediately after install |
| Build a custom component without checking 21st.dev first | Browse 21st.dev — if a close match exists, use it and remap tokens |

---

## API ROUTES REFERENCE

| Route | Method | Phase | Purpose |
|-------|--------|-------|---------|
| `/api/gemini/delta-summary` | POST | 6 | Generate AI diff summary for a Change Control |
| `/api/gemini/risk-insights` | POST | 10 | Generate AI risk summary for Reports |
| `/api/storage/signature` | POST | 2 | Upload signature to Supabase Storage, return URL |
| `/api/storage/sop-upload` | POST | 5 | Upload .docx to Supabase Storage, return URL |
| `/api/cron/pm-alerts` | GET | 7 | Daily cron: check due PM tasks, create Pulse notifications |
| `/api/cron/overdue-check` | GET | 7 | Daily cron: mark overdue PM tasks, flag overdue SOPs |

---

## SUPABASE FUNCTIONS REFERENCE

| Function | Used In Phase | Purpose |
|----------|---------------|---------|
| `handle_new_user()` | 1 | Trigger: auto-create profile on auth signup |
| `get_user_dept_is_qa(uuid)` | 1 | Used in RLS policies to check QA membership |
| `calculate_next_due(date, text, int)` | 1 | Compute next PM due date from frequency |
| `approve_sop_request(uuid, uuid)` | 5 | Atomic SOP approval — sets status, triggers CC if update |
| `complete_pm_task(uuid, uuid, text)` | 7 | Atomic PM completion — updates equipment, creates next task |
| `get_pm_compliance(uuid)` | 9 | Returns PM completion % for a dept this month |

---

*End of BUILD.md*
