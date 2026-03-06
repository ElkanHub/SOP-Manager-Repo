# 🏗️ SOP-Guard Pro: System Design & Architecture

This document provides a comprehensive blueprint for the SOP-Guard Pro application, detailing the user flows, application structure, and expanded product requirements.

---

## 🚀 1. User Flows

### 👤 Admin Flow: Setup & Onboarding

1. **Identity Creation:** Admin registers and creates the Organization profile.
2. **Team Onboarding:** Admin invites Managers and Workers via email.
3. **Governance Setup:** Admin defines Departments (e.g., Engineering, Safety) and global settings.

### 👤 Manager Flow: Content & Compliance

1. **Authoring:** Manager creates or imports an SOP draft.
2. **Change Control:** Manager submits an edit, triggering the **Consensus Protocol**.
3. **Review & Sign:** Manager reviews the "AI Delta Summary" and provides a Digital Signature for pending requests.
4. **PM Management:** Manager schedule maintenance tasks for assets and assigns them to worker categories.

### 👤 Worker Flow: Execution & Safety

1. **The Pulse:** Worker views their personalized dashboard for today's PM tasks and unread SOP updates.
2. **Execution:** Worker completes a PM task, optionally uploading a photo of the completed work.
3. **Acknowledgment:** Worker reads a newly released SOP and clicks "Acknowledge & Sign" to confirm understanding.

---

## 📂 2. Application Structure

### System Architecture (Dynamic Node Model)

The application utilizes a **Tree-Node Architecture**, a hierarchical data model optimized for enterprise scalability and strict data inheritance.

* **Frontend:** Next.js 15 (Adaptive, Recursive UI components).
* **Database:** Supabase (PostgreSQL with Tree-based RLS).
* **AI Service:** Google Gemini 3 Flash (Context-aware across the tree).
* **Real-time:** WebSockets for "The Pulse" sidebar (data-driven node updates).

### 📁 Directory Roadmap

* `/app/(dashboard)`
  * `/[dept_node]`: Dynamic routing for department-specific views.
  * `/equipment`: Unified asset registry (categorized by node).
  * `/sops`: The Global Vault resource branch.
* `/components/recursive`: Data-driven UI (Sidebar, Breadcrumbs).
* `/lib/tree`: Logic for traversing and managing the Node Tree.
* `/lib`: Shared utilities (AI logic, formatting, db clients).
* `/hooks`: Custom React hooks for state and data fetching.

---

## 📝 3. Detailed PRD & Improvements

### 3.1 Digital Trust: The Signature System
>
> [!IMPORTANT]
> To meet industrial compliance (like ISO 9001 or 21 CFR Part 11), a simple button click is insufficient.

* **Improvement:** Implement a "Signature Vault".
  * Users must draw or upload a signature during onboarding.
  * When signing an approval, the system generates a cryptographically hashed "Signature Certificate" containing: Name, UID, Timestamp, IP Address, and the Signature Image.
  * This certificate is permanently attached to the SOP version.

### 3.2 The "Acknowledge" Loop (Worker Compliance)

* **Improvement:** "Active Learning" Mode.
  * Instead of just a "Read" button, Gemini can generate a 3-question "Micro-Quiz" based on the SOP content.
  * Workers must pass the quiz (all correct) to "Sign Off" on the SOP.
  * **Manager Insight:** Managers see a "Competency Heatmap" showing which departments are lagging in SOP understanding.

### 3.3 Asset Lifecycle Management

* **Improvement:** QR Code Integration.
  * Every Asset in the registry gets a generated QR code.
  * Workers can scan the physical code on a machine to instantly open its specific **SOP** or **Maintenance Task** in the app.
  * This eliminates "Wrong Asset" errors (e.g., servicing Pump A instead of Pump B).

### 3.4 AI Contradiction Engine

* **Improvement:** Cross-Document Validation.
  * When a Manager creates a new SOP, Gemini scans the *entire* library for contradictions.
  * *Example:* "Warning: This new SOP suggests using Water for cleaning, but SOP-102 (Safety) forbids liquid contact with this equipment."

---

## 🛠️ 4. Technical Strategy

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Best-in-class performance and SEO/Metadata control. |
| **Styling** | Tailwind CSS + Shadcn/UI | Rapid development of a professional "Enterprise" look. |
| **ORM** | Prisma / Drizzle | Type-safe database interactions. |
| **AI** | Google Gemini 3 Flash | Low latency for summaries and contradiction checks. |
| **Real-time** | Pusher / Ably | Powering "The Pulse" with instant task updates. |
