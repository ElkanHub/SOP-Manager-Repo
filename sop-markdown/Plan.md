# 📑 Product Requirements Document: SOP-Guard Pro

**Project Codename:** SOP-Guard Pro  
**Version:** 1.0 (Initial Implementation)  
**Target:** Industrial/Corporate Internal Management

---

## 1. Executive Summary

SOP-Guard Pro is a centralized platform for managing Standard Operating Procedures (SOPs) and Preventive Maintenance (PM). It bridges the gap between high-level compliance and ground-level execution. The system ensures 100% accountability through a "Zero-Unapproved-Changes" policy and reduces equipment downtime through an automated AI-driven maintenance scheduler.

---

## 2. User Roles & Permissions (RBAC)

| Role | Responsibility | Key Access |
| :--- | :--- | :--- |
| **Admin** | System Oversight | Full CRUD, User Onboarding, Audit Logs. |
| **Manager** | Quality & Compliance | Edit SOPs, Approve Change Controls, Assign PM. |
| **Worker** | Execution | View Active SOPs, Complete PM tasks, Daily To-Dos. |

---

## 3. Functional Requirements

### 3.1 SOP Management & Versioning

* **Central Repository:** A searchable database of all company SOPs.
* **Version Control:** Every SOP has a version number (e.g., $v2.1.0$).
* **The "Gold" Rule:** Only "Active" SOPs are visible to Workers. "Draft" and "Pending" states are Manager-only.

### 3.2 Change Control Workflow (The "Retainer" Feature)

* **Initiation:** A Manager edits an existing SOP. This creates a Change Request.
* **Consensus Approval:** The system identifies all active Managers. The Change Request remains "Pending" until 100% of Managers provide a digital signature.
* **AI Summary (Gemini 3 Flash):** When a Change Request is issued, Gemini 3 compares the old and new versions to generate a "Delta Summary" for the approvers.

### 3.3 Preventive Maintenance (PM) Planner

* **Asset Registry:** List of all equipment (Pumps, Servers, Vehicles, etc.).
* **Scheduled Triggers:** Set maintenance intervals (Daily, Monthly, Quarterly).
* **Broadcast Alerts:** On the due date, a push notification/email is sent to all Workers assigned to that asset category.

### 3.4 "The Pulse" (Right-Side To-Do Panel)

A persistent, real-time widget that adapts to the user:

* **Manager View:** Pending Approvals (Red), Overdue PM Reports (Yellow), Active Change Controls.
* **Worker View:** Today's PM Tasks, Expiring SOP certifications, Personal Daily Tasks.

---

## 4. Technical Specifications

* **Architecture:** **Dynamic Node Model (Tree-Node Structure)** for data-driven scalability.
* **Frontend:** Next.js 15+ with recursive, adaptive UI components.
* **Database:** Supabase (PostgreSQL) with hierarchical RLS policies.
* **Intelligence:** Gemini 3 Flash for:
  * Automated SOP categorization and tree placement.
  * Cross-node contradiction checks.
  * Natural language search across the Global Vault.
* **Hosting:** Vercel or AWS (Enterprise-ready).

---

## 5. Success Metrics (For the Client)

* **Audit Readiness:** Reduce time to pull compliance logs from days to seconds.
* **Zero-Error Rate:** Ensure no worker ever sees an outdated version of a procedure.
* **Uptime Increase:** Decrease unplanned downtime by at least 15% through strict PM adherence.

---

## 6. Implementation Roadmap

### 🔐 1. Authentication & Onboarding

**Goal:** Establish security and Role-Based Access (RBAC) immediately.

* **Login Page:** Simple, clean "Enterprise" look. Options for "Single Sign-On" (SSO) placeholders.
* **Role Selection (Admin Only):** A hidden flow where the first user sets up the company profile and invites "Managers" and "Workers."
* **Profile Setup:** Users upload their Digital Signature (a PNG or drawn signature) for Change Control approvals.

### 📊 2. The Main Dashboard (The "Command Center")

**Goal:** A high-level overview of the company’s health.

* **KPI Widgets:**
  * "Total Active SOPs"
  * "Pending Change Controls" (Red if > 0)
  * "Maintenance Compliance %" (A gauge showing on-time PMs).
* **The Pulse (Right Sidebar):** Persistent actions, today's PM tasks, and recent activity logs.

### 📄 3. SOP Library (The "Vault")

**Goal:** The central repository for all documentation.

* **Table View:** List of all documents with Title, Version, Category, Last Updated, and Status.
* **Smart Search:** AI-powered search bar for keywords or natural language queries.
* **"Import Word" Button:** Drag and drop legacy .docx files.

### ✍️ 4. The Document Workspace (The "Word Experience")

**Goal:** Where the actual work happens.

* **The Editor:** A full-width rich-text editor (MS Word style).
* **Version History Panel (Left):** View older versions ($v1.0$, $v1.1$, etc.).
* **Action Bar:** "Save Draft" or "Issue Change Control" (locks doc and sends for approval).
* **AI Side-Panel:** Gemini-powered window for "Auto-Summary" and contradiction checks.

### ✅ 5. Change Control Center (Manager Only)

**Goal:** The "Consensus" gatekeeper.

* **Approval Queue:** List of SOPs waiting for signatures.
* **The "Diff" Viewer:** Red/Green highlights showing Old vs. New versions.
* **Manager Signature Grid:** Status of all company managers (✅ Approved / ⏳ Pending).
* **Finalize Button:** Clickable only when all managers have signed.

### 🛠️ 6. Preventive Maintenance (PM) Planner

**Goal:** To prevent equipment failure.

* **Calendar View:** Monthly/weekly view of scheduled maintenance.
* **Asset Manager:** List of machines with associated SOPs, frequency, and last service date.
* **Trigger Logic:** Sends push notifications to Workers' "Pulse" panels on the due date.

### 📈 7. Reports & Audit Logs

**Goal:** Effortless audit process.

* **Change History Report:** Downloadable PDF/CSV of all changes, approvals, and timestamps.
* **Worker Completion Log:** Records of SOP reads and PM task completions.
* **AI Insights:** Risk level summaries generated by Gemini.

### ⚙️ 8. Settings & Configuration

**Goal:** System customization.

* **Department Management:** Define Chemical, Mechanical, IT, etc.
* **Notification Prefs:** Toggle Email, SMS, or In-App alerts.
* **Backup & Export:** "Nuclear Option" to export all SOPs back to Word format.

---

## 🛑 Gap Analysis: What's Missing for a "True" MVP?

1. **Digital Signature & Audit Log (Compliance Requirement)**
    * **The Feature:** Store a "Snapshot" (Name, Timestamp, IP, Signature Image).
    * **Why:** Essential for legal proof in case of audits or accidents.
2. **"Acknowledge" Loop for Workers**
    * **The Feature:** "I have read and understood" button for workers.
    * **Why:** Track compliance and generate "Compliance Gap Reports."
3. **Basic "Asset" Metadata**
    * **The Feature:** Asset Cards (Serial Number, Model, Photo).
    * **Why:** Specificity in maintenance tasks prevents errors.

---

## ✅ Revised MVP Feature List (The "Go-To-Market" Set)

| Module | MVP "Must-Haves" (Phase 1) | Post-MVP "Nice-to-Haves" (Phase 2) |
| :--- | :--- | :--- |
| **Auth** | Email/Pass + Basic RBAC. | Single Sign-On (SSO) / Okta. |
| **SOPs** | Upload Word, View-in-App, Search. | AI-generated training quizzes from SOPs. |
| **Approval** | Multi-Manager Sign-off + Audit Log. | Advanced "Track Changes" (Redlines). |
| **Maintenance**| Calendar, Equipment List, Due Alerts. | IoT sensor integration (Auto-Alerts). |
| **To-Do** | Simple Daily List + Due Dates. | Drag-and-drop task reordering. |
