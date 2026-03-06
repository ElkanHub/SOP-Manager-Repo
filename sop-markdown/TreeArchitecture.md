# 🌳 SOP-Guard Pro: Dynamic Node Architecture (The Logic Tree)

This document details the hierarchical, data-driven structure that powers SOP-Guard Pro. Instead of hard-coded pages, the application uses a **Tree-Node Model** to manage departments, permissions, and resources dynamically.

---

## 🏗️ 1. The Hierarchy Levels

### Level 0: The Root (System Control)

* **Owner:** Global Admin.
* **Function:** System-wide module toggles.
* **Example:** Enabling "Asset Maintenance" globally or disabling "Reports" for the entire organization during setup.

### Level 1: Department Nodes (The Context Gate)

* **Nodes:** `[Engineering]`, `[QA]`, `[Production]`, `[Logistics]`.
* **Logic:** Users inherit access based on their `dept_id` link to a Level 1 node.
* **QA Privilege:** QA is defined as a "Global Listener" node, allowing it to traverse and view all sibling department nodes.

### Level 2: Resource Nodes (The Content)

Each Department Node acts as a parent to two primary resource branches:

#### Branch A: SOP Library

* **Structure:** `Department Node` -> `SOP Branch` -> `Document Nodes`.
* **Visibility:** Filtered by parent node ID (except for QA).
* **Operations:** Triggers Change Control workflows which are nodes themselves.

#### Branch B: Equipment Registry

* **Structure:** `Department Node` -> `Equipment Branch` -> `Asset Nodes`.
* **Integrated PM:** `Asset Node` -> `PM Sub-Node`.
* **Logic:** The PM Planner pulls maintenance intervals directly from its parent Asset Node.

---

## 🛠️ 2. The Recursive UI System

The application's sidebar and navigation are **not hard-coded**. They are generated recursively from the Database Tree.

* **Dynamic Sidebar:** If a new Department Node is created in Level 1, it automatically populates the navigation for QA and Admins.
* **Inherited Permissions:** Security rules (Supabase RLS) are applied based on the position within the tree.

### 📊 Navigation Logic Table

| Page Level | Visibility Rule | Tree Context |
| :--- | :--- | :--- |
| **Global Vault** | QA / Admin | `root.children.find(SOP_BRANCH).all()` |
| **Dashboard** | Dept Member | `user.dept_node.dashboard_view` |
| **Equipment** | Everyone | `root.children.filter(EQUIPMENT_BRANCH)` |
| **PM Planner** | Everyone | `asset_node.children.find(PM_NODE)` |

---

## 💰 3. Business Value: Scale-on-Demand

By using **Dynamic Node Architecture**, SOP-Guard Pro is an enterprise-scale platform.

* **Zero-Maintenance Scaling:** Adding a new branch or department requires no code changes.
* **Future-Proof:** The hierarchical model can support sub-departments and multi-site locations simply by adding more nested nodes.
* **Competitive Edge:** This architecture transforms the app from a "tool" into a "scalable ERP infrastructure."
