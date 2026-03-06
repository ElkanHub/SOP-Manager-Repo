# SOP-GUARD PRO
# Master Architecture & Product Blueprint

**Version 1.0  |  Initial Implementation**
*Centralized SOP Management & Preventive Maintenance Platform*
*Industrial / Corporate Internal Management*

---

## TABLE OF CONTENTS

1. [PART 1: PRODUCT REQUIREMENTS DOCUMENT](#part-1-product-requirements-document)
2. [PART 2: SYSTEM DESIGN & ARCHITECTURE](#part-2-system-design-architecture)
3. [PART 3: MASTER APP BLUEPRINT](#part-3-master-app-blueprint)
4. [PART 4: DYNAMIC NODE ARCHITECTURE — THE LOGIC TREE](#part-4-dynamic-node-architecture--the-logic-tree)
5. [PART 5: FUTURE IMPROVEMENTS (POST-MVP)](#part-5-future-improvements-post-mvp)
6. [GLOSSARY OF TERMS](#glossary-of-terms)

---

## PART 1: PRODUCT REQUIREMENTS DOCUMENT

### 1. Executive Summary
SOP-Guard Pro is a centralized platform for managing Standard Operating Procedures (SOPs) and Preventive Maintenance (PM). It bridges the gap between high-level compliance and ground-level execution. The system ensures 100% accountability through a "Zero-Unapproved-Changes" policy and reduces equipment downtime through an automated AI-driven maintenance scheduler.

### 2. User Roles & Permissions (RBAC)

| Role | Responsibility | Key Access |
| :--- | :--- | :--- |
| **Admin** | System Oversight | Full CRUD, User Onboarding, Audit Logs |
| **Manager** | Quality & Compliance | Edit SOPs, Approve Change Controls, Assign PM |
| **Worker** | Execution | View Active SOPs, Complete PM tasks, Daily To-Dos |

### 3. Functional Requirements

#### 3.1 SOP Management & Versioning
- **Central Repository**: A searchable database of all company SOPs.
- **Version Control**: Every SOP has a version number (e.g., v2.1.0).
- **The "Gold" Rule**: Only "Active" SOPs are visible to Workers. "Draft" and "Pending" states are Manager-only.

#### 3.2 Change Control Workflow (The "Retainer" Feature)
- **Initiation**: A Manager edits an existing SOP, chooses between initiating a Change Request Protocol or saving as just a typo correction.
- **Consensus Approval**: The Change Request remains "Pending" until 100% of Managers provide a digital signature.
- **AI Summary**: (Google Gemini - model: `gemini-3-flash`): Compares old and new versions to generate a "Delta Summary" for approvers.

#### 3.3 Preventive Maintenance (PM) Planner
- **Asset Registry**: List of all equipment (Pumps, Servers, Vehicles, etc.).
- **Scheduled Triggers**: Set maintenance intervals (Daily, Monthly, Quarterly, Half year, Yearly).
- **Broadcast Alerts**: Push notification/email sent to all Workers assigned to that asset category on the due date.

#### 3.4 "The Pulse" (Right-Side To-Do Panel)
A persistent, real-time widget that adapts to the user:
- **Manager View**: Pending Approvals (Red), Overdue PM Reports (Yellow), Active Change Controls.
- **Worker View**: Today's PM Tasks, Expiring SOP certifications, Personal Daily Tasks.

### 4. Technical Specifications

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Best-in-class performance and metadata control |
| **Styling** | Tailwind CSS + Shadcn/UI | Rapid professional 'Enterprise' look |
| **Database** | Supabase (PostgreSQL) | Hierarchical RLS policies, tree-based security |
| **ORM** | Prisma | Type-safe database interactions |
| **AI** | Google Gemini 3 Flash | Low latency summaries and contradiction checks |
| **Real-time** | Pusher / Ably | Powering 'The Pulse' with instant task updates |
| **Hosting** | Vercel | Enterprise-ready deployment |

### 5. Success Metrics
- **Audit Readiness**: Reduce time to pull compliance logs from days to seconds.
- **Zero-Error Rate**: Ensure no worker ever sees an outdated version of a procedure.
- **Uptime Increase**: Decrease unplanned downtime by at least 15% through strict PM adherence.

### 6. Implementation Roadmap

#### Phase 1: Authentication & Onboarding
- **Login Page**: Simple, clean Enterprise look with Single Sign-On (SSO) placeholders.
- **Role Selection (Admin Only)**: Hidden flow for company profile setup and team invitations.
- **Profile Setup**: Users upload their Digital Signature (PNG or drawn) for Change Control approvals.

#### Phase 2: Main Dashboard — The Command Center
- **KPI Widgets**: Total Active SOPs, Pending Change Controls (Red if > 0), Maintenance Compliance % gauge.
- **The Pulse (Right Sidebar)**: Persistent actions, today's PM tasks, and recent activity logs.

#### Phase 3: SOP Library — The Vault
- **Table View**: Title, Version, Category, Last Updated, and Status.
- **Smart Search**: AI-powered search bar for keywords or natural language queries.
- **Import Word Button**: Drag-and-drop legacy .docx file import.

#### Phase 4: Document Workspace — The Word Experience
- **Full-width rich-text editor** (MS Word style).
- **Version History Panel (Left)**: View older versions.
- **Action Bar**: Save Draft or Issue Change Control (locks doc and sends for approval).
- **AI Side-Panel**: Gemini-powered window for Auto-Summary and contradiction checks.

#### Phase 5: Change Control Center (Manager Only)
- **Approval Queue**: List of SOPs waiting for signatures.
- **Diff Viewer**: Red/Green highlights showing Old vs. New versions.
- **Manager Signature Grid**: Status of all company managers (Approved / Pending).
- **Finalize Button**: Clickable only when all managers have signed.

#### Phase 6: PM Planner
- **Calendar View**: Monthly/weekly view of scheduled maintenance.
- **Asset Manager**: List of machines with associated SOPs, frequency, and last service date.
- **Trigger Logic**: Sends push notifications to Workers' Pulse panels on the due date.

#### Phase 7: Reports & Audit Logs
- **Change History Report**: Downloadable PDF/CSV of all changes, approvals, and timestamps.
- **Worker Completion Log**: Records of SOP reads and PM task completions.
- **AI Insights**: Risk level summaries generated by Gemini.

#### Phase 8: Settings & Configuration
- **Department Management**: Define Chemical, Mechanical, IT, etc.
- **Notification Preferences**: Toggle Email, SMS, or In-App alerts.
- **Backup & Export**: Nuclear Option to export all SOPs back to Word format.

### 7. Gap Analysis — What's Missing for True MVP
1. **Digital Signature & Audit Log (Compliance Requirement)**: Store a Snapshot (Name, Timestamp, IP, Signature Image). Essential for legal proof in case of audits or accidents.
2. **Acknowledge Loop for Workers**: "I have read and understood" button with compliance gap reporting.
3. **Basic Asset Metadata**: Asset Cards (Serial Number, Model, Photo) for specificity in maintenance tasks.

### 8. Revised MVP Feature List

| Module | MVP Must-Haves (Phase 1) | Post-MVP Nice-to-Haves (Phase 2) |
| :--- | :--- | :--- |
| **Auth** | Email/Pass + Basic RBAC | Single Sign-On (SSO) / Okta |
| **SOPs** | Upload Word, View-in-App, Search | AI-generated training quizzes from SOPs |
| **Approval** | Multi-Manager Sign-off + Audit Log | Advanced Track Changes (Redlines) |
| **Maintenance** | Calendar, Equipment List, Due Alerts | IoT sensor integration (Auto-Alerts) |
| **To-Do** | Simple Daily List + Due Dates | Drag-and-drop task reordering |

---

## PART 2: SYSTEM DESIGN & ARCHITECTURE

### 1. User Flows

#### Admin Flow: Setup & Onboarding
1. **Identity Creation**: Admin registers and creates the Organization profile.
2. **Team Onboarding**: Admin invites Managers and Workers via email.
3. **Governance Setup**: Admin defines Departments (Engineering, Safety, etc.) and global settings.

#### Manager Flow: Content & Compliance
1. **Authoring**: Manager creates or imports an SOP draft.
2. **Change Control**: Manager submits an edit, triggering the Consensus Protocol.
3. **Review & Sign**: Manager reviews the AI Delta Summary and provides a Digital Signature.
4. **PM Management**: Manager schedules maintenance tasks for assets and assigns to worker categories.

#### Worker Flow: Execution & Safety
1. **The Pulse**: Worker views their personalized dashboard for today's PM tasks and unread SOP updates.
2. **Execution**: Worker completes a PM task, optionally uploading a photo of completed work.
3. **Acknowledgment**: Worker reads a newly released SOP and clicks "Acknowledge & Sign" to confirm understanding.

### 2. Application Structure

#### System Architecture — Dynamic Node Model
The application utilizes a Tree-Node Architecture, a hierarchical data model optimized for enterprise scalability and strict data inheritance.

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (Adaptive, Recursive UI) | Adaptive, recursive UI components |
| **Database** | Supabase (PostgreSQL) | Tree-based Row Level Security (RLS) |
| **AI Service** | Google Gemini 3 Flash | Context-aware across the node tree |
| **Real-time** | WebSockets | Pulse sidebar with data-driven node updates |

#### Directory Roadmap
- `/app/(dashboard)` — Main dashboard routes
    - `/[dept_node]` — Dynamic routing for department-specific views
    - `/equipment` — Unified asset registry (categorized by node)
    - `/sops` — The Global Vault resource branch
- `/components/recursive` — Data-driven UI (Sidebar, Breadcrumbs)
- `/lib/tree` — Logic for traversing and managing the Node Tree
- `/lib` — Shared utilities (AI logic, formatting, db clients)
- `/hooks` — Custom React hooks for state and data fetching

### 3. Detailed Improvements

#### 3.1 Digital Trust: The Signature System
To meet industrial compliance (ISO 9001 or 21 CFR Part 11), a simple button click is insufficient. A Signature Vault with cryptographic hashing is required.
- Users must draw or upload a signature during onboarding.
- When signing, the system generates a cryptographically hashed Signature Certificate containing: Name, UID, Timestamp, IP Address, and Signature Image.
- This certificate is permanently attached to the SOP version.

#### 3.2 The Acknowledge Loop — Active Learning Mode
- Instead of just a Read button, Gemini generates a 3-question Micro-Quiz based on the SOP content.
- Workers must pass the quiz (all correct) to Sign Off on the SOP.
- **Manager Insight**: Managers see a Competency Heatmap showing which departments are lagging in SOP understanding.

#### 3.3 Asset Lifecycle Management — QR Code Integration
- Every Asset in the registry gets a generated QR code.
- Workers scan the physical code on a machine to instantly open its SOP or Maintenance Task in the app.
- This eliminates "Wrong Asset" errors (e.g., servicing Pump A instead of Pump B).

#### 3.4 AI Contradiction Engine — Cross-Document Validation
- When a Manager creates a new SOP, Gemini scans the entire library for contradictions.
- *Example*: "Warning: This new SOP suggests using Water for cleaning, but SOP-102 (Safety) forbids liquid contact with this equipment."

---

## PART 3: MASTER APP BLUEPRINT

### 1. Core Objectives & MVP Scope
SOP-Guard Pro is a modular, high-accountability platform for managing Standard Operating Procedures (SOPs) and Preventive Maintenance (PM).

#### MVP Scope: Targeted Departments
1. **Engineering Department**: Primary users of equipment and technical SOPs.
2. **Quality Assurance (QA) Department**: The Overseer Department. QA manages all documentation used across the app to ensure compliance and quality.

#### Modular & Dynamic Architecture
- **The Logic Tree**: The system is a hierarchy of nodes (Root > Department > Resource).
- **Admin Power**: Admins can shape the architecture by adding/removing nodes without code changes.
- **Recursive UI**: Navigation and permissions are generated dynamically from the tree structure.
- **Document Flexibility**: SOP nodes can be created, versioned, or removed with sub-second latency.

### 2. User Roles & Departmental Logic

| Role | Responsibility | Key Access |
| :--- | :--- | :--- |
| **Admin** | System Oversight | Modular setup, Dept management, User Onboarding |
| **Manager** | Approval & Strategy | Signature authority, PM scheduling, Dept view oversight |
| **Worker** | Execution | Daily tasks, SOP reading, PM completion |

#### The QA Overseer Role
- **Global Visibility**: QA members can view and edit all documents in the system, regardless of which department authored them.
- **Edit vs. Sign**: While all QA members can edit documents, only the QA Manager has the authority to provide a digital signature for Change Control approvals.

#### Onboarding & Routing
- **Department Collection**: During onboarding, the system collects the user's assigned department.
- **Personalized Landing**: Upon login, users are routed to their Department-specific page (e.g., Engineering Dashboard vs. QA Oversight Dashboard).

### 3. Functional Modules

#### 3.1 SOP Library & Workspace
- **Document Management**: Fast CRUD operations for SOPs. Supports drag-and-drop Word (.docx) imports.
- **The Gold Rule**: Only Active versions are shown to workers. Drafts remain in the Manager/QA workspace.
- **Change Control Protocol**: 100% consensus signature from required Managers is mandatory for version updates.
- **AI Delta Summary**: `gemini-3-flash` generates summaries of changes between versions for faster reviews.

#### 3.2 Preventive Maintenance & Equipment
- **Equipment Registry**: A dedicated page listing all assets, categorized by department.
- **Maintenance Linkage**: Every equipment entry is directly linked to its PM schedule and corresponding SOP.
- **Trigger Alerts**: Automated notifications sent to the Pulse sidebar when maintenance is due.

#### 3.3 The Pulse — Adaptive UI
A persistent right-side panel that changes based on role and department:
- **Engineering Worker**: Today's PM tasks for their machines.
- **QA Manager**: Pending approvals and document change requests across the whole company.

---

## PART 4: DYNAMIC NODE ARCHITECTURE — THE LOGIC TREE

Instead of hard-coded pages, the application uses a Tree-Node Model to manage departments, permissions, and resources dynamically.

### 1. The Hierarchy Levels

#### Level 0: The Root (System Control)
- **Owner**: Global Admin.
- **Function**: System-wide module toggles.
- **Example**: Enabling Asset Maintenance globally or disabling Reports for the entire organization during setup.

#### Level 1: Department Nodes (The Context Gate)
- **Nodes**: [Engineering], [QA], [Production], [Logistics].
- **Logic**: Users inherit access based on their `dept_id` link to a Level 1 node.
- **QA Privilege**: QA is defined as a "Global Listener" node, allowing it to traverse and view all sibling department nodes.

#### Level 2: Resource Nodes (The Content)
Each Department Node acts as a parent to two primary resource branches:

**Branch A: SOP Library**
- **Structure**: Department Node > SOP Branch > Document Nodes.
- **Visibility**: Filtered by parent node ID (except for QA).
- **Operations**: Triggers Change Control workflows which are nodes themselves.

**Branch B: Equipment Registry**
- **Structure**: Department Node > Equipment Branch > Asset Nodes.
- **Integrated PM**: Asset Node > PM Sub-Node.
- **Logic**: The PM Planner pulls maintenance intervals directly from its parent Asset Node.

### 2. The Recursive UI System
The application's sidebar and navigation are not hard-coded. They are generated recursively from the Database Tree.
- **Dynamic Sidebar**: If a new Department Node is created in Level 1, it automatically populates the navigation for QA and Admins.
- **Inherited Permissions**: Security rules (Supabase RLS) are applied based on the position within the tree.

#### Navigation Logic

| Page Level | Visibility Rule | Tree Context |
| :--- | :--- | :--- |
| **Global Vault** | QA / Admin only | `root.children.find(SOP_BRANCH).all()` |
| **Dashboard** | Dept Member | `user.dept_node.dashboard_view` |
| **Equipment** | Everyone | `root.children.filter(EQUIPMENT_BRANCH)` |
| **PM Planner** | Everyone | `asset_node.children.find(PM_NODE)` |

### 3. Business Value: Scale-on-Demand
By using Dynamic Node Architecture, SOP-Guard Pro is an enterprise-scale platform:
- **Zero-Maintenance Scaling**: Adding a new branch or department requires no code changes.
- **Future-Proof**: The hierarchical model can support sub-departments and multi-site locations simply by adding more nested nodes.
- **Competitive Edge**: This architecture transforms the app from a tool into a scalable ERP infrastructure.

---

## PART 5: FUTURE IMPROVEMENTS (POST-MVP)

1. **Digital Signature Vault**: Cryptographic hashing for legal signature compliance (ISO 9001 / 21 CFR Part 11 readiness).
2. **Worker Active Learning**: AI-generated quizzes to verify SOP understanding before sign-off. Includes a Competency Heatmap for managers.
3. **QR Code Integration**: Scan a machine's physical QR code to instantly open its maintenance manual or associated SOP.
4. **AI Contradiction Engine**: Automatically scans for conflicting instructions between different SOPs across the entire library.
5. **Single Sign-On (SSO) / Okta Integration**: Enterprise identity provider support for streamlined authentication.
6. **IoT Sensor Integration**: Auto-trigger maintenance alerts based on real-time equipment sensor data.
7. **Advanced Track Changes (Redlines)**: Full Microsoft Word-style redline tracking within the document editor.
8. **Drag-and-Drop Task Reordering**: Enhanced task management UX within the Pulse sidebar.

---

## GLOSSARY OF TERMS

| Term | Definition |
| :--- | :--- |
| **SOP** | Standard Operating Procedure — a documented set of step-by-step instructions for a routine activity |
| **PM** | Preventive Maintenance — scheduled maintenance performed to reduce the risk of equipment failure |
| **RBAC** | Role-Based Access Control — a method of restricting system access based on the roles of individual users |
| **RLS** | Row Level Security — a database security feature that controls which rows a user can access |
| **Change Control** | A formal process for managing changes to SOPs, requiring multi-manager consensus approval |
| **The Pulse** | A real-time, adaptive right-side panel showing personalized tasks and alerts per user role |
| **Delta Summary** | An AI-generated summary of differences between two versions of an SOP, produced by Gemini 3 Flash |
| **Gold Rule** | The rule that only "Active" SOPs are visible to Workers; Drafts and Pending states are Manager-only |
| **Node** | A single unit in the Dynamic Node Architecture, representing a Department, Resource, or Asset |
| **Global Listener** | QA department's special privilege allowing it to view and traverse all sibling department nodes |
