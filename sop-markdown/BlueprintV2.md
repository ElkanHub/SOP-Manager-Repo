# SOP-GUARD PRO
# Master Architecture & Product Blueprint

**Version 2.0 | Consolidated Specification**
*Centralized SOP Management & Preventive Maintenance Platform*
*Consolidated from PRD, System Design, Architecture Spec & Scrapbook Notes*

---

## What Changed in v2.0
This version incorporates fundamental clarifications regarding the SOP approval flow, the central role of the **Quality Assurance (QA)** department, the shift to a **Rich-Text Viewer** model (external editing in MS Word), and the addition of the **Company Calendar** and **Notice/Broadcast** modules.

---

## TABLE OF CONTENTS

1. [PART 1 — Core Objectives & MVP Scope](#part-1--core-objectives--mvp_scope)
2. [PART 2 — User Roles & Onboarding](#part-2--user_roles--onboarding)
3. [PART 3 — SOP Library (The Vault)](#part-3--sop_library_the_vault)
4. [PART 4 — The Pulse (Adaptive Real-Time Sidebar)](#part-4--the_pulse_adaptive_real-time_sidebar)
5. [PART 5 — Company Calendar](#part-5--company_calendar)
6. [PART 6 — Preventive Maintenance (PM) Planner](#part-6--preventive_maintenance_pm_planner)
7. [PART 7 — Department Pages](#part-7--department_pages)
8. [PART 8 — Reports & Audit Logs](#part-8--reports--audit_logs)
9. [PART 9 — Technology Stack](#part-9--technology_stack)
10. [PART 10 — Full User Flows](#part-10--full_user_flows)
11. [PART 11 — Revised Feature List & Roadmap](#part-11--revised_feature_list--roadmap)
12. [PART 12 — Key Design Decisions Log](#part-12--key_design_decisions_log)
13. [Appendix — Glossary](#appendix--glossary)

---

## PART 1 — Core Objectives & MVP Scope
SOP-Guard Pro is a modular, high-accountability platform for managing Standard Operating Procedures (SOPs) and Preventive Maintenance (PM). It eliminates the risk of workers operating from outdated procedures, ensures all document changes are formally reviewed, and keeps equipment maintenance schedules on track through automated alerts.

### 1.1 The Problem This Solves

| Challenge | Business Risk |
| :--- | :--- |
| Workers may access outdated SOP versions | Safety incidents, failed audits, incorrect execution |
| No formal change approval process | Unapproved edits reaching the floor undetected |
| Missed preventive maintenance schedules | Unplanned downtime, equipment degradation |
| No audit trail for document approvals | Inability to prove compliance during inspections |
| No broadcast channel for urgent notices | Critical information not reaching all staff reliably |

### 1.2 MVP Scope — Targeted Departments
For the initial launch, the system focuses on two core departments:
- **Engineering Department**: Primary users of equipment SOPs and PM tasks.
- **Quality Assurance (QA) Department**: The Overseer Department. QA is the single approval authority for all SOP additions, edits, and equipment registry entries across the entire platform.

> [!IMPORTANT]
> **The QA Principle**: All SOPs — regardless of which department authors them — flow through QA for approval. QA is the governance layer of the entire system. No document becomes Active without QA sign-off.

### 1.3 Modular Architecture
The system is built on a **Dynamic Node Architecture** (Tree-Node Structure). Every department, resource, and permission is data-driven.
- **The Logic Tree**: Root > Department Node > Resource Node (SOP Branch or Equipment Branch).
- **Admin Power**: Departments and modules can be added or removed from a config panel without code changes.
- **Recursive UI**: Navigation, permissions, and sidebar tabs are generated dynamically from the tree.
- **Infinite Scalability**: Sub-departments and multi-site locations are handled by adding nested nodes.

---

## PART 2 — User Roles & Onboarding

### 2.1 Role Definitions

| Role | Scope | Key Permissions |
| :--- | :--- | :--- |
| **Admin** | System-wide | Full CRUD, user onboarding, department management, audit logs, module toggles |
| **Manager (QA)** | Global — all departments | Approve/reject SOPs, issue Change Controls, approve equipment, final sign-off |
| **Manager (Dept)** | Own department | Scoped to dept SOPs. Signs Change Controls for their department's documents |
| **Worker** | Own department | View Active SOPs, complete PM tasks, submit edit requests, acknowledge notices |

> [!NOTE]
> **Revised Role Logic**: The 'Manager' role in this app does not solely map to a job title. It designates a user who is part of the digital signature/approval chain. Users self-select Manager or Worker on signup.

### 2.2 Sign-Up & Onboarding Flow

1. **Register**: User enters name, email, and password to create their account.
2. **Select Department**: User selects assigned department (populated by Admin). Department auto-fills for future submissions (except for QA).
3. **Select Role**: User selects Manager or Worker.
4. **Official Profile Details**: User fills in job title, employee ID, contact number, etc.
5. **Digital Signature**: User draws or uploads a signature image (PNG), stored securely for Change Control.
6. **Personalized Routing**: On login, user is routed to their Department Dashboard (QA sees global oversight).

> [!TIP]
> **QA Department Special Case**: When a QA member adds an SOP, the Department field does *not* auto-fill. QA must manually select the target department.

---

## PART 3 — SOP Library (The Vault)

### 3.1 Library Structure
The SOP Library is the central repository for all company procedures. Editing and approval rights are governed by role.

- **The SOP Record**: Contains SOP Number, Title, Department, Version, Date Listed, Date Revised, Revision Due Date, Status (Draft / Pending QA Review / Active), and Approving QA Member.
- **Data-Driven Departments**: Departments are inferred and populated from the SOPs that exist in the library. Adding an SOP for a new department creates that department node automatically.

### 3.2 Viewing & Navigation
- **Tab-Based Document Opening**: Multiple SOPs can be open simultaneously for side-by-side reference.
- **Department Sidebar Tabs**: Users see their own department tab; QA sees all tabs.
- **Search**: Read-only access to all SOPs across all departments for all users.
- **Rich-Text Viewer**: SOPs are displayed in a formatted read-only viewer. **There is no in-app text editor.**

> [!IMPORTANT]
> **Architecture Change**: All text editing is done externally in Microsoft Word. The app provides a rich-text VIEWER. Users upload `.docx` files; the system renders and stores them.

### 3.3 SOP Submission Flow (Any Department)

1. **Author in Word**: User creates or edits SOP in MS Word locally.
2. **Upload to System**: User clicks "Upload SOP" or "Submit Edit", attaching the `.docx` and filling metadata.
3. **QA Notified**: Request appears on the QA Pulse sidebar (requester, dept, SOP number, type).
4. **QA Reviews**: QA opens the dedicated Approval Page showing content and requester details.
5. **QA Decision**: (A) Approve (moves to Active or Change Control) or (B) Request Changes (with comments).
6. **Back-and-Forth Thread**: Author revises Word file locally, re-uploads, and resubmits until QA is satisfied.
7. **Final Approval**: QA approves. New SOPs go Active; updates enter Change Control.

### 3.4 Change Control Process
Triggered when an Active SOP is updated.
- **Initiation**: QA initiates after content approval.
- **AI Delta Summary**: Gemini 3 Flash generates a comparison highlighting changes.
- **Signatories**: Required Managers and QA Manager review the Diff Viewer (Side-by-side) and Delta Summary.
- **Digital Sig**: Execution of the digital signature.
- **Activation**: New version becomes Active; old version is archived in Version History.

> [!IMPORTANT]
> **The Gold Rule**: No version reaches a Worker's view without completing the full QA approval and Change Control chain. Workers only ever see Active SOPs.

---

## PART 4 — The Pulse (Adaptive Real-Time Sidebar)
The Pulse is the persistent notification hub and task list visible to all users.

### 4.1 Pulse Content by Role

| Role | Pulse Shows |
| :--- | :--- |
| **QA Manager** | Pending SOP requests, Change Control signatures, overdue PM reports, unread notices |
| **Dept Manager** | Pending signatures for dept SOPs, overdue PM tasks, unread notices |
| **Worker** | Today's PM tasks, new Active SOPs to acknowledge, unread notices, personal to-dos |

### 4.2 Notice & Broadcast System
Lightweight, direct communication channel for work-relevant information.
- **Composing**: Select audience (Person, Group, Dept, Everyone).
- **Delivery**: Immediate toast and permanent display in recipient's Pulse.
- **Acknowledgment**: Recipients must click "Acknowledged". Sender tracks counts in real time.
- **Deletion**: Author can delete to remove from all recipients.

### 4.3 Personal To-Dos
Private task items for the individual user. Separate from system-assigned PM tasks.

---

## PART 5 — Company Calendar
A global, shared calendar consolidating activities, events, and maintenance schedules.

### 5.1 Event Types & Visibility

| Event Type | Created By | Visible To | Description |
| :--- | :--- | :--- | :--- |
| **Public Event** | Any User | Everyone | Meetings, audits, shutdowns, deadlines |
| **Personal / Dept** | Any User | Dept Only | Dept-specific activities or reminders |
| **PM Maintenance** | PM Planner | Everyone | Auto-populated scheduled maintenance dates |

### 5.2 Calendar Rules
- **Inbuilt**: Not a link to external calendars; lives inside the app.
- **Color-Coded**: Events are distinct by type.
- **Auto-Feed**: PM Planner feeds maintenance dates automatically.

---

## PART 6 — Preventive Maintenance (PM) Planner

### 6.1 Overview
Public-facing calendar and registry. **QA must approve all new equipment additions.**

### 6.2 Asset Registry
Asset Cards contain:
- Name, Unique ID, Department Owner.
- Serial Number, Model, Photo.
- **Linked SOP**: The procedure for servicing this asset.
- **Frequency**: Daily, Weekly, Monthly, etc.
- **Service History**: Log of all completed tasks with worker names and timestamps.

### 6.3 Equipment Submission & Approval Flow
1. **Submit**: Any User fills the equipment form.
2. **QA Notified**: Appears as a pending request on QA Pulse.
3. **QA Reviews**: Reviews details and approves or requests corrections.
4. **Live**: Asset enters the registry and its schedule appears on the Calendar.

---

## PART 7 — Department Pages
Aggregated view for a department's SOPs, equipment, PM tasks, and calendar events.

### 7.1 Sidebar Navigation
- Users see their own department tab.
- **QA Privilege**: QA sees ALL department tabs and can manage documents globally.

### 7.2 What the Department Page Shows

| Section | Content |
| :--- | :--- |
| **SOP List** | Active SOPs for the dept (SOP No., Title, Version, Revision dates) |
| **Pending Submissions** | Dept SOPs awaiting QA approval (Managers/QA only) |
| **Equipment & PM** | Registered equipment and maintenance due dates |
| **Dept Calendar** | Filtered calendar view for the department |

---

## PART 8 — Reports & Audit Logs

### 8.1 Available Reports

| Report | Contents | Available To |
| :--- | :--- | :--- |
| **SOP Change History** | Full log of versions, edits, comments, QA decisions, signatures | QA, Admin |
| **Worker Acknowledgment** | Records of which workers read/signed Active SOPs | QA, Dept Manager, Admin |
| **PM Completion Log** | Completed/Overdue tasks with worker names, photos, timestamps | All Managers, Admin |
| **Notice Log** | Audit of notices sent, audiences, and acknowledgment counts | Admin, QA |
| **AI Risk Insights** | Gemini-generated compliance risk levels (overdue items, low sign-offs) | QA, Admin |

### 8.2 Export Formats
- Downloadable as **PDF** or **CSV**.
- **The Nuclear Option**: Bulk-export the full SOP library back to `.docx` via Admin Settings.

---

## PART 9 — Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) | Recursive, adaptive UI for the dynamic node tree |
| **Styling** | Tailwind CSS + Shadcn/UI | Rapid professional enterprise UI |
| **Database** | Supabase (PostgreSQL) | RLS for departmental data isolation |
| **Real-time** | Supabase Realtime | Powers The Pulse sidebar via WebSockets |
| **AI** | Google Gemini 3 Flash | Delta Summaries, contradiction detection, risk insights |
| **Storage** | Supabase Storage | `.docx` files, photos, signature images |
| **Hosting** | Vercel | Enterprise-grade global deployment |

> [!TIP]
> **Strategy**: By removing the in-app editor, the system sidesteps complexity in conflict resolution and autosave, focusing instead on governance and accountability.

---

## PART 10 — Full User Flows

### 10.1 Admin Flow
1. **Org Setup**: Register company and initial department structure.
2. **Team Invite**: Invite Managers and Workers via email.
3. **Module Config**: Toggle PM Planner, Calendar, or Reports.
4. **Oversight**: Read access to all audit logs and system activity.

### 10.2 QA Manager Flow
1. **Oversight**: Global dashboard; Pulse shows all pending requests.
2. **Review**: Clicks Pulse to review SOP content and metadata.
3. **Decision**: Approve or request changes.
4. **Goverance**: Signs Change Control; reviews equipment submissions.

### 10.3 Department Manager Flow
1. **Department View**: Local dashboard; Pulse shows signatures and PM alerts.
2. **Authoring**: Edits locally in Word, uploads to QA.
3. **Approval Chain**: Signs Change Controls after reviewing AI Diff/Summary.

### 10.4 Worker Flow
1. **Execution**: Department page shows PM tasks and SOP updates.
2. **Ack**: Marks SOPs as "Read & Understood".
3. **Maintenance**: Performs PM tasks, uploads proof photos, and marks complete.

---

## PART 11 — Revised Feature List & Roadmap

### 11.1 MVP Must-Haves (Phase 1)

| Module | Feature | Notes |
| :--- | :--- | :--- |
| **Auth** | Role + Dept selection, Digital Sig upload | All users |
| **SOP Library** | `.docx` Upload, Tab-based viewer | Read-only in-app |
| **QA Approval** | Submission → Pulse → Comment thread → Decision | QA-gated |
| **Change Control** | Diff Viewer, AI Summary, Signature Grid | Formal gate |
| **The Pulse** | Notification hub, Notice system, To-dos | Real-time |
| **Calendar** | Global + Dept events, Auto-PM dates | Shared visibility |

### 11.2 Post-MVP (Phase 2)
- **AI Worker Micro-Quiz**: Gemini-generated quiz before SOP sign-off.
- **QR Code Asset Scanning**: Instant access to SOP/PM via physical scan.
- **AI Contradiction Engine**: Library-wide cross-check for conflicting instructions.
- **IoT Sensors**: Auto-triggering PM alerts from real-time data.

---

## PART 12 — Key Design Decisions Log

| Decision | Original Approach | Final Approach | Reason |
| :--- | :--- | :--- | :--- |
| **SOP Authority** | Multi-manager consensus | QA is sole approval authority | Practicality at scale; QA as single source of truth |
| **In-App Editor** | MS Word-style editor | Rich-text Viewer Only | Sidesteps editing complexity; focus on governance |
| **Dept Creation** | Manual Admin setup | Data-driven / Inferred | Reduces overhead; library drives the architecture |
| **Equipment Adm** | Free addition by depts | QA Approval Required | Mirrors SOP governance model |
| **Notifications** | PM-tasks Only | Full Notice/Broadcast System | Missing comms channel identified |

---

## Appendix — Glossary

| Term | Definition |
| :--- | :--- |
| **SOP** | Standard Operating Procedure — documented step-by-step instructions |
| **PM** | Preventive Maintenance — scheduled proactive maintenance |
| **Change Control** | Formal approval process for updating an Active SOP |
| **The Pulse** | Persistent real-time sidebar for tasks and alerts |
| **Delta Summary** | AI-generated summary of differences between SOP versions |
| **QA Overseer** | QA's global role as the final approval authority |
| **Approval Thread** | Permanent log of revisions and comments between submitter and QA |
| **Node** | A unit in the Dynamic Node Architecture (Dept, Resource, Asset) |
| **Active SOP** | The version Workers are authorized to see |
| **Superseded** | An archived, read-only previous version of an SOP |
