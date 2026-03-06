# 📘 SOP-Guard Pro: Master App Blueprint

This document serves as the single source of truth for the SOP-Guard Pro application. It consolidates the product requirements, system architecture, and core objectives into a coherent development guide.

---

## 🎯 1. Core Objectives & MVP Scope

SOP-Guard Pro is a modular, high-accountability platform for managing Standard Operating Procedures (SOPs) and Preventive Maintenance (PM).

### 🛠️ MVP Scope: Targeted Departments
For the Initial Launch (MVP), the system will focus on two core departments:
1.  **Engineering Department:** Primary users of equipment and technical SOPs.
2.  **Quality Assurance (QA) Department:** The **Overseer Department**. QA manages all documentation used across the app to ensure compliance and quality.

### 📐 Modular & Dynamic Architecture
The system is built on a **Dynamic Node Architecture (Tree-Node Structure)**. This ensures that the app is data-driven and infinitely scalable:
*   **The Logic Tree:** The system is a hierarchy of nodes (Root > Department > Resource).
*   **Admin Power:** Admins can shape the architecture by adding/removing nodes (Departments, Modules) without code changes.
*   **Recursive UI:** Navigation and permissions are generated dynamically from the tree structure.
*   **Document Flexibility:** SOP nodes can be created, versioned, or removed with sub-second latency.

---

## 👥 2. User Roles & Departmental Logic

### Role-Based Access (RBAC)
| Role | Responsibility | Key Access |
| :--- | :--- | :--- |
| **Admin** | System Oversight | Modular setup, Dept management, User Onboarding. |
| **Manager** | Approval & Strategy | Signature authority, PM scheduling, Dept view oversight. |
| **Worker** | Execution | Daily tasks, SOP reading, PM completion. |

### 🔍 The QA "Overseer" Role
The QA department has unique privileges across the platform:
*   **Global Visibility:** QA members can view and edit **all** documents in the system, regardless of which department authored them.
*   **Edit vs. Sign:** While all QA members can edit documents, only the **QA Manager** has the authority to provide a digital signature for Change Control approvals.

### 🚀 Onboarding & Routing
*   **Department Collection:** During onboarding, the system collects the user's assigned department.
*   **Personalized Landing:** Upon login, users are automatically routed to their Department-specific page (e.g., Engineering Dashboard vs. QA Oversight Dashboard).

---

## 📂 3. Functional Modules

### 3.1 SOP Library & Workspace
*   **Document Management:** Fast CRUD operations for SOPs. Supports drag-and-drop Word (.docx) imports.
*   **The "Gold" Rule:** Only "Active" versions are shown to workers. Drafts remain in the Manager/QA workspace.
*   **Change Control Protocol:** 100% consensus signature from required Managers is mandatory for version updates.
*   **AI Delta Summary:** Gemini 3 Flash generates summaries of changes between versions for faster reviews.

### 3.2 Preventive Maintenance (PM) & Equipment
*   **Equipment Registry:** A dedicated page listing all assets, categorized by department.
*   **Maintenance Linkage:** Every equipment entry is directly linked to its Preventive Maintenance schedule and corresponding SOP.
*   **Trigger Alerts:** automated notifications sent to the "Pulse" sidebar when maintenance is due.

### 3.3 "The Pulse" (Adaptive UI)
A persistent right-side panel that changes based on role and department:
*   **Engineering Worker:** Today's PM tasks for their machines.
*   **QA Manager:** Pending approvals and document change requests across the whole company.

---

## 🏗️ 4. System Architecture

### 📊 Technology Stack
*   **Frontend:** Next.js 15 (App Router).
*   **Backend/Database:** **Supabase** (PostgreSQL) with Row Level Security (RLS) for strict departmental isolation where needed.
*   **AI:** Google Gemini 3 Flash (Summaries, Search, Contradiction checks).
*   **Styling:** Tailwind CSS + Shadcn/UI for a premium industrial aesthetic.

### 📁 Directory Structure
*   `/app/(dashboard)`
    *   `/engineering`: Department-specific views.
    *   `/qa`: Oversite and global doc management.
    *   `/equipment`: Asset registry linked to maintenance.
    *   `/sops`: The central vault.
*   `/lib/modular`: Logic for enabling/disabling system features by Admin.

---

## 📈 5. Future Improvement Ideas (Post-MVP)

1.  **Digital Signature Vault:** Cryptographic hashing for legal signature compliance.
2.  **Worker "Active Learning":** AI-generated quizzes to verify SOP understanding before sign-off.
3.  **QR Code Integration:** Scan a machine's physical QR code to instantly open its maintenance manual.
4.  **AI Contradiction Engine:** Automatically scans for conflicting instructions between different SOPs.
