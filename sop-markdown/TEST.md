# SOP-Guard Pro — TEST.md
> **Testing Master Checklist** | Use this file before every release and before every client demo.
> Two sections: (1) Solo testing — everything you verify yourself before anyone else sees the app.
> (2) Team demo testing — the guided scenarios you run with the client team to validate and polish.

---

## HOW TO USE THIS FILE

- Work through **Section 1** completely on your own first. Fix everything before inviting the team.
- Use **Section 2** as a script for the client demo session. Assign one person per role account.
- Mark each item `[x]` as you go. Do not demo anything with open `[ ]` items in Section 1.
- When you find a bug, note it at the bottom of the relevant section under **Bugs Found**.

### Test Accounts to Create Before Starting
You need these accounts live in the system before any testing:

| Account | Role | Department | Purpose |
|---------|------|------------|---------|
| `admin@test.com` | Admin | QA | System-wide control |
| `qa.manager@test.com` | Manager | QA | QA approvals, change control signing |
| `eng.manager@test.com` | Manager | Engineering | Dept management, CC signing |
| `eng.worker@test.com` | Worker | Engineering | Floor-level tasks, SOP reading |
| `logistics.manager@test.com` | Manager | Logistics | Cross-dept submission testing |
| `logistics.worker@test.com` | Worker | Logistics | Cross-dept worker perspective |

> Complete onboarding for every account including uploading a digital signature. All test accounts need a real signature stored — the Change Control tests won't work without it.

### Test Files to Prepare
- `test-sop-new.docx` — a short dummy SOP, 1–2 pages, labelled SOP-TEST-001
- `test-sop-updated.docx` — a modified version of the above with 2–3 clear paragraph changes
- `test-sop-wrong-format.txt` — a plain text file to test file type rejection

---

## SECTION 1 — SOLO TESTING (Pre-Demo Checklist)

Work through every module in order. Each test has a clear action and expected result.

---

### 1.1 Authentication & Onboarding

- [ ] **Signup — happy path.** Create a new account with a fresh email. Confirm you land on `/onboarding` immediately after.
- [ ] **Onboarding Step 1.** Account details are pre-filled from signup. Name and email are correct.
- [ ] **Onboarding Step 2.** Department dropdown populates from the database. Selecting a department and clicking Next saves the choice.
- [ ] **Onboarding Step 3.** Both role cards (Manager / Worker) are visible and selectable. Selected card shows teal border and teal background.
- [ ] **Onboarding Step 4.** Job Title is required — Next is blocked without it. Employee ID and Phone are optional. Avatar upload works and shows circular preview.
- [ ] **Onboarding Step 5 — Draw.** Signature canvas loads. Drawing with mouse/touch produces a smooth stroke. Clear button wipes the canvas. Confirm saves the signature.
- [ ] **Onboarding Step 5 — Upload.** Uploading a PNG signature image works. Preview shown before confirming.
- [ ] **Signature storage.** After completing onboarding, check Supabase Storage → `signatures/` bucket. The file exists. The `profiles.signature_url` column is populated.
- [ ] **Onboarding gate.** Log out. Log back in as the same user. Confirm you land on the dashboard, not onboarding again.
- [ ] **Incomplete onboarding redirect.** Manually open a new account, complete only Step 1, then try to navigate to `/dashboard`. Confirm you are redirected back to `/onboarding`.
- [ ] **Login — wrong password.** Enter incorrect password. Confirm red error banner appears, not a crash.
- [ ] **Login — session persistence.** Log in, close the browser tab, reopen the app. Confirm you are still logged in without re-entering credentials.
- [ ] **Logout.** Click Sign Out from the avatar dropdown. Confirm redirect to `/login`. Confirm navigating back to `/dashboard` redirects to `/login`.
- [ ] **Admin role.** Manually set `admin@test.com` role to `admin` via Supabase dashboard. Log in as admin. Confirm Settings shows Departments and Users tabs.

---

### 1.2 Shell Layout & Navigation

- [ ] **Top nav.** Logo visible left. Search input visible centre. Bell icon and avatar visible right. All on `bg-brand-navy`.
- [ ] **Sidebar — standard user.** Log in as `eng.worker@test.com`. Sidebar shows "MY DEPARTMENT" label with Engineering. No "ALL DEPARTMENTS" section visible.
- [ ] **Sidebar — QA user.** Log in as `qa.manager@test.com`. Sidebar shows "MY DEPARTMENT" (QA) AND "ALL DEPARTMENTS" section listing all other departments.
- [ ] **Active nav state.** Clicking each nav link (Dashboard, SOP Library, Equipment, Calendar, Reports) highlights the correct item with teal left border and bold text.
- [ ] **Sidebar collapse.** Resize browser to laptop width (1024–1279px). Sidebar collapses to icon-only strip. Hovering icons shows label tooltip.
- [ ] **Pulse panel.** Pulse panel visible on the right on desktop. At tablet width (768–1023px) it hides. Bell icon in top nav shows unread count badge.
- [ ] **No layout shift.** Navigate between all pages rapidly. Shell never flickers, reloads, or shifts position.
- [ ] **Role badge.** Bottom of sidebar shows the correct role badge (Admin / Manager / Worker) for the logged-in user.

---

### 1.3 SOP Library — Reading

- [ ] **Table loads.** Log in as `eng.worker@test.com`. SOP Library table loads with real data (you need at least one Active SOP seeded).
- [ ] **Worker Gold Rule.** As `eng.worker`, only Active SOPs are visible. No Draft or Pending rows appear.
- [ ] **Manager visibility.** Log in as `eng.manager@test.com`. Draft and Pending SOPs for Engineering department are visible.
- [ ] **QA global visibility.** Log in as `qa.manager@test.com`. SOPs from all departments are visible. Department filter shows all departments.
- [ ] **Column sorting.** Clicking SOP No., Title, Status, and Due for Revision column headers sorts the table correctly.
- [ ] **Status badge colours.** Active = green. Draft = amber. Pending = blue. Superseded = grey. Overdue due date = red bold text.
- [ ] **Open SOP in tab.** Click any SOP row. It opens in a tab at the top of the page. The tab shows SOP number + title.
- [ ] **Multiple tabs.** Open three different SOPs. All three tabs appear in the strip. Clicking between tabs switches the viewer content correctly.
- [ ] **Tab close.** Click the X on a tab. That tab closes. The adjacent tab becomes active. Closing the last tab shows the empty library state.
- [ ] **Docx renders.** The viewer displays the SOP content as formatted HTML — headings, paragraphs, lists render correctly. No raw XML or broken tags visible.
- [ ] **Viewer header.** SOP No., Title, department badge, version badge, status badge, Last Revised date, and Approved By name all visible above the document.
- [ ] **Version history.** Click Version History button. SlideOver panel opens from the right. Past versions listed. Clicking a past version renders it in the viewer with a SUPERSEDED watermark.
- [ ] **Acknowledge button — appears.** As `eng.worker`, open an Active SOP they have not yet acknowledged. The Acknowledge button is visible in the action bar.
- [ ] **Acknowledge button — works.** Click Acknowledge. Button changes to confirmed state (green, checkmark). Check `sop_acknowledgements` in Supabase — row exists with correct user_id, sop_id, version, timestamp.
- [ ] **Acknowledge button — disappears.** Refresh the page and open the same SOP again. The Acknowledge button is gone (already acknowledged).
- [ ] **Search.** Type a partial SOP title into the search bar. Table filters correctly. Clearing the search restores all rows.

---

### 1.4 SOP Submission & QA Approval

- [ ] **Upload modal — opens.** As `eng.worker`, click "Upload SOP" button. Modal opens.
- [ ] **Upload modal — file validation.** Drag `test-sop-wrong-format.txt` into the upload zone. Error message appears: wrong file type. The `.docx` is the only accepted format.
- [ ] **Upload modal — happy path.** Upload `test-sop-new.docx`. Fill in SOP Number (SOP-TEST-001), Title, confirm Department. Select "New SOP". Add a note to QA. Submit.
- [ ] **Submission confirmed.** Success state appears: green checkmark, "Submitted for QA review" message.
- [ ] **Pulse notification — QA receives.** Log in as `qa.manager@test.com` in a second browser/tab (or after submitting). The new submission appears in The Pulse Priority section in real-time, without a page refresh.
- [ ] **Pulse item detail.** The Pulse item shows the correct SOP number, submitter name, department, and "time ago" timestamp.
- [ ] **QA Approvals page.** Navigate to `/qa/approvals`. The submission appears as a card. Non-QA users (test with `eng.worker`) are redirected away from this page.
- [ ] **QA approval view — document renders.** Click the submission card. The submitted `.docx` renders in the left panel viewer.
- [ ] **QA approval view — requester details.** Right panel shows submitter name, department, role, employee ID, submission timestamp.
- [ ] **QA requests changes.** Click "Request Changes". Textarea appears. Type a comment. Send. Confirm: (a) approval request status updates to `changes_requested`, (b) the original submitter receives a Pulse notification.
- [ ] **Re-submission.** Log back in as `eng.worker`. Open the Pulse notification. Upload `test-sop-updated.docx` as the correction. Resubmit.
- [ ] **Approval thread.** In the QA approval view, the thread now shows both entries: the original submission and the re-submission with the QA comment between them.
- [ ] **QA approves new SOP.** Click Approve. Confirm: (a) SOP status changes to `active`, (b) it now appears in the SOP Library for the Engineering department, (c) `eng.worker` can see it.
- [ ] **Submitting an update to an Active SOP.** As `eng.manager`, use Submit Edit on an existing Active SOP and upload `test-sop-updated.docx`. QA approves it. Confirm a Change Control is created (not immediate activation) — SOP status should be `pending_cc`.
- [ ] **Audit log.** Check `audit_log` table in Supabase. Entries exist for: submission, QA comment, re-submission, approval. Each has correct actor_id, entity_type, entity_id, and timestamp.

---

### 1.5 Change Control

- [ ] **Change Control page loads.** Navigate to the Change Control created in the previous test. Page renders with header, diff viewer, AI summary panel, and signature grid.
- [ ] **CC header.** SOP name, CC reference number, issued date, and "Pending Signatures" status badge (red) all correct.
- [ ] **Diff viewer — content.** Left column shows old version. Right column shows new version. Changed paragraphs highlighted in red (left) and green (right).
- [ ] **Diff viewer — toggle.** "Show Changes Only" toggle hides unchanged sections. "Show All" restores them.
- [ ] **AI delta summary.** Summary card shows 3–5 bullet points describing the changes in plain English. Sparkles icon present.
- [ ] **AI summary disclaimer.** "This summary is AI-generated. Review the full diff before signing." text visible below the bullets.
- [ ] **Regenerate summary.** Click the regenerate icon. A new summary is requested and displayed. (Test this once — don't spam it.)
- [ ] **Signature grid — correct signatories.** The correct Managers are listed as required signatories. All show "Pending" badge.
- [ ] **Sign button — correct user only.** Log in as `eng.manager`. The Sign button is visible for them. Log in as `eng.worker` — Sign button is not visible (they are not a signatory).
- [ ] **Signature confirm modal.** Click Sign as `eng.manager`. Modal opens showing their stored signature image and the SOP title/version. "Confirm & Sign" button visible.
- [ ] **Signature recorded.** Click Confirm & Sign. Check `signature_certificates` in Supabase — row exists with user_id, signature_url, signed_at, and ip_address populated.
- [ ] **Signature grid updates.** After signing, `eng.manager` row in the grid shows green "Signed" badge with timestamp. Without a page refresh (real-time update).
- [ ] **All signatures → SOP goes Active.** Have all required signatories sign. Confirm: (a) CC status changes to `complete`, (b) new SOP version status = `active`, (c) old version = `superseded`, (d) workers can now see the new version.
- [ ] **Superseded version archived.** Open the SOP in the library. Version history shows the old version as Superseded. It is viewable but watermarked.
- [ ] **Pulse — completion notification.** All signatories receive a Pulse notification: "[SOP title] v[X] is now Active."

---

### 1.6 Preventive Maintenance Planner

- [ ] **Equipment table loads.** Navigate to Equipment page as `eng.manager`. Table renders.
- [ ] **Add equipment modal.** Click "Add Equipment". Form opens. Fill in all fields: name, serial number, model, maintenance frequency, last service date. Link to an Active SOP. Submit.
- [ ] **QA pending state.** Newly added equipment shows status `pending_qa`. It is NOT visible to `eng.worker` (test this).
- [ ] **QA equipment approval.** Log in as `qa.manager`. The equipment submission appears in The Pulse. Approve it.
- [ ] **Equipment goes live.** After QA approval, equipment appears in the active registry for all Engineering users including workers.
- [ ] **Asset detail sheet.** Click the equipment row. SlideOver panel opens from the right. Shows asset name, ID, dept badge, status badge, serial number, model, linked SOP link, maintenance frequency, and an empty Service History.
- [ ] **QR code.** Asset detail sheet shows a QR code SVG. It is readable (scan it with a phone to confirm it encodes something meaningful).
- [ ] **PM task alert — Pulse.** Manually set `next_due` for the test asset to today's date in Supabase. Trigger the cron endpoint (`/api/cron/pm-alerts`). Confirm `eng.worker` receives a Pulse alert for the overdue task.
- [ ] **PM completion.** As `eng.worker`, click the PM task in The Pulse. Open Asset Detail Sheet. Click "Log PM Completion". Add a note. Submit. Confirm: (a) task status = `complete`, (b) a new `pm_tasks` row is created for the next cycle, (c) `equipment.last_serviced` is updated, (d) `equipment.next_due` is recalculated.
- [ ] **Service history.** Open Asset Detail Sheet again. The completed task now appears in the Service History with worker name, date, and note.
- [ ] **PM calendar population.** Navigate to the Calendar page. The new `next_due` date appears as a teal PM chip on the correct date.

---

### 1.7 Company Calendar

- [ ] **Calendar loads.** Navigate to Calendar page. Monthly grid renders with correct current month and today highlighted.
- [ ] **PM events auto-appear.** Equipment maintenance dates (from PM Planner) appear as teal chips without manual entry.
- [ ] **Create public event.** Click a future date. New Event modal opens. Fill in Title, select "Public (Company-wide)". Submit. Event appears on the calendar as a blue chip.
- [ ] **Public event visibility.** Log in as `logistics.worker`. Navigate to Calendar. The public event created above is visible.
- [ ] **Create dept event.** Create another event, select "My Department Only". Submit.
- [ ] **Dept event visibility.** Log in as `logistics.worker`. The dept-only Engineering event is NOT visible. Log in as `eng.worker` — it IS visible.
- [ ] **Upcoming events list.** The right-side upcoming events panel lists the next 7 days of events in chronological order.
- [ ] **Month navigation.** Prev/Next month arrows work. "Today" button returns to the current month.

---

### 1.8 Notice System & The Pulse

- [ ] **Send notice — everyone.** As `eng.manager`, click "Send Notice" in The Pulse. Select "Everyone". Fill in Subject and Message. Send.
- [ ] **Real-time delivery.** In a second browser logged in as `eng.worker`, the notice appears in their Pulse as a popup toast AND in the Notices section — without a page refresh.
- [ ] **Toast auto-dismiss.** The toast notification disappears after ~4 seconds.
- [ ] **Acknowledge.** As `eng.worker`, click the Acknowledged button on the notice. It turns green with a checkmark.
- [ ] **Sender sees count.** As `eng.manager`, the notice in their Pulse shows "X of Y acknowledged" count update in real-time after the worker acknowledges.
- [ ] **Send notice — department.** Send a notice targeted to "Engineering" only. Log in as `logistics.worker` — the notice does NOT appear in their Pulse.
- [ ] **Send notice — individual.** Send a notice to a specific user by searching their name. Only that user receives it.
- [ ] **Delete notice.** As the author, click the trash icon on a notice. Confirm dialog appears. Confirm deletion. Notice disappears from the author's Pulse AND from all recipient Pulses in real-time.
- [ ] **Personal to-dos.** In The Pulse, add a personal to-do item. It appears in the To-Do section. Check the checkbox to complete it — it shows greyed with strikethrough. Delete it — it disappears.
- [ ] **Pulse priority section.** As `qa.manager`, pending SOP approvals appear in the Priority section (red badge). As `eng.manager`, pending CC signatures appear in Priority.
- [ ] **Pulse today section.** As `eng.worker`, today's PM tasks appear in the Today section.

---

### 1.9 Dashboard

- [ ] **KPI cards load.** All four KPI cards display real numbers: Active SOPs, Pending Approvals, PM Compliance %, SOPs Due for Revision.
- [ ] **Number count-up animation.** Page load triggers the number count-up animation on all KPI cards (0 → actual value).
- [ ] **KPI colour logic.** Set conditions to trigger each colour: Pending Approvals > 0 should show red. PM Compliance < 70% should show red. Create these conditions and verify.
- [ ] **KPI click navigation.** Clicking each KPI card navigates to the correct filtered page.
- [ ] **Activity feed.** Recent Activity feed shows the last 10 actions from the Engineering department. Format correct: avatar, name, action verb, SOP/asset name, time ago.
- [ ] **Activity feed — real-time.** Trigger an action (acknowledge a SOP, complete a PM) in another tab. The new entry appears at the top of the feed without refreshing.
- [ ] **Upcoming PM list.** Shows the next 5 maintenance due dates with correct urgency colours (red = overdue, amber = ≤7 days, green = OK).
- [ ] **Role adaptation — QA.** Log in as `qa.manager`. KPI counts are global (across all departments, not just QA).
- [ ] **Role adaptation — dept user.** Log in as `eng.manager`. KPI counts are scoped to Engineering only.

---

### 1.10 Reports

- [ ] **Report selector.** Navigate to `/reports`. Left sidebar lists all 5 report types. Clicking each loads the correct report.
- [ ] **SOP Change History report.** Shows log entries for SOPs with correct columns: SOP No., Action, Actor, Timestamp, Version.
- [ ] **Worker Acknowledgement report.** Shows which workers have acknowledged which SOP versions with timestamps.
- [ ] **PM Completion report.** Shows all completed (and overdue) PM tasks with worker names and dates.
- [ ] **Notice Log report.** Shows sent notices with audience, send time, and acknowledgement counts.
- [ ] **AI Risk Insights report.** Card renders with a risk level badge (Low / Medium / High) and Gemini-generated bullet points.
- [ ] **Date range filter.** Apply a date range filter to any report. Results update correctly to the filtered range.
- [ ] **Department filter — QA.** As `qa.manager`, change the department filter. Report updates to show data for the selected department.
- [ ] **Department filter — non-QA.** As `eng.manager`, the department filter is locked to Engineering. They cannot see other departments' data.
- [ ] **CSV export.** Click "Export CSV" on a report. A `.csv` file downloads. Open it and confirm the data is correct and readable.

---

### 1.11 Settings & Admin

- [ ] **Profile edit.** As any user, open Settings → Profile. Change Job Title. Save. Refresh the page. The new title is shown.
- [ ] **Avatar change.** Upload a new avatar image. Circular preview appears. Save. Avatar updates in the top nav and sidebar.
- [ ] **Signature re-draw.** Click "Re-draw Signature". Signature canvas opens. Draw a new signature. Save. Check `profiles.signature_url` in Supabase — URL updated.
- [ ] **Notification prefs.** Toggle email notifications off. Save. Toggle back on. No crash.
- [ ] **Admin — add department.** As `admin@test.com`, Settings → Departments. Click "Add Department". Enter "Maintenance". Save. Navigate to the sidebar — a new "Maintenance" entry is not yet visible (no users assigned). Assign a test user to it via User Manager. The sidebar updates for that user.
- [ ] **Admin — change user role.** In User Manager, change `eng.worker@test.com` from Worker to Manager. Log in as that user. Confirm they can now access the Change Control signing flow.
- [ ] **Admin — cannot change own role.** As `admin@test.com`, the role dropdown is disabled on their own row.
- [ ] **Non-admin blocked.** As `eng.manager`, navigate to `/settings`. Confirm Departments and Users tabs do not appear.

---

### 1.12 Loading, Empty & Error States

- [ ] **Skeleton loaders.** Throttle network speed in browser DevTools to "Slow 3G". Reload dashboard. Skeleton loaders appear before data loads — no blank white spaces or layout jumps.
- [ ] **Empty SOP Library.** Create a new department with no SOPs. Log in as a user in that department. SOP Library shows a designed empty state with an "Upload First SOP" prompt.
- [ ] **Empty PM Planner.** Same — new department with no equipment shows the PM Planner empty state.
- [ ] **Empty Pulse.** All tasks complete, no notices, no approvals. Pulse shows "You're all caught up" message.
- [ ] **Network error handling.** Disable network in DevTools mid-session. Trigger a data action (submit a form). Error state appears inline — not a blank screen or unhandled exception.
- [ ] **No console errors.** Open browser DevTools Console. Navigate through every page. Zero red errors at any point.

---

### 1.13 Responsive Layout

- [ ] **1280px+ (desktop).** All three columns visible: sidebar (240px), main content, Pulse (300px).
- [ ] **1024–1279px (laptop).** Sidebar collapses to 56px icon strip. Main content expands. Pulse still visible.
- [ ] **768–1023px (tablet).** Sidebar hidden (hamburger icon in top nav opens it as a drawer). Pulse hidden (bell icon shows count, click opens full-screen Pulse panel).
- [ ] **< 768px (mobile).** Single column. Tables switch to card-stack layout. All actions still reachable.
- [ ] **No horizontal scroll on any breakpoint.**

---

### Section 1 — Bugs Found
> Record any issues discovered during solo testing here before proceeding to the demo.

| # | Page / Feature | Description | Severity (High/Med/Low) | Fixed? |
|---|----------------|-------------|------------------------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---
---

## SECTION 2 — TEAM DEMO TESTING (Client Session Script)

This section is a guided demo for you to run with the client's team. The goal is twofold: show them how the system works end-to-end using their own roles, and surface anything that needs polishing before handoff.

### Before the Session

**Setup checklist:**
- [ ] Section 1 is complete with zero open High severity bugs
- [ ] All six test accounts are created and onboarded (signatures included)
- [ ] At least 3 real-looking SOPs are seeded as Active in the system (use actual SOP content from the client if possible — it makes the demo feel real)
- [ ] At least 2 pieces of equipment are registered and approved
- [ ] One upcoming PM task is due within 7 days
- [ ] The app is running on the production Vercel URL — not localhost
- [ ] All participants have their login credentials before the session starts
- [ ] Screen sharing is set up if remote, or a projector if in person

**Assign roles to participants:**
Give each participant a test account that matches their actual job role. If the team is small, one person can hold multiple accounts and switch between them.

---

### Demo Scenario A — "First Day on the Platform"
**Goal:** Show the onboarding experience and the basic navigation.
**Who does this:** One participant who has not yet logged in.
**Time:** ~10 minutes

- [ ] Participant receives their login credentials and opens the app for the first time.
- [ ] Walk them through the onboarding wizard — department selection, role, profile, signature. Let them draw their own signature.
- [ ] They land on the dashboard. Ask them: "What do you see? Does this match what your day looks like?"
- [ ] Navigate to the SOP Library. Find a procedure relevant to their department. Open it.
- [ ] Ask them: "Is this how you expected to find a procedure? What would you search for?"
- [ ] Acknowledge the SOP. Show them the confirmation.

**Watch for:** Confusion at any onboarding step. Anything that feels unnatural about the navigation. Whether the dashboard immediately makes sense to them.

---

### Demo Scenario B — "Submitting a Procedure for Review"
**Goal:** Show the full submission and QA approval loop.
**Who does this:** One Engineering Manager + one QA Manager participant (two screens side by side is ideal).
**Time:** ~15 minutes

- [ ] Engineering Manager opens the SOP Library. Clicks "Upload SOP".
- [ ] They upload a real `.docx` procedure from their organisation (or the test file). Fill in the metadata form together.
- [ ] Submit it. They see the confirmation.
- [ ] **Live on the QA Manager's screen:** The Pulse notification appears in real-time. Ask the group: "Did you see that come through without refreshing?"
- [ ] QA Manager opens the approval view. Reviews the document.
- [ ] QA Manager types a comment requesting one small change. Sends it.
- [ ] **Live on the Engineering Manager's screen:** The Pulse notification arrives. They see the comment.
- [ ] Engineering Manager re-uploads the corrected version with a note.
- [ ] QA Manager reviews and approves.
- [ ] For a new SOP: confirm it appears Active in the library.
- [ ] For an update to an existing SOP: show that Change Control has been triggered (next scenario).

**Watch for:** Any friction in the upload form. Whether the real-time Pulse notification lands quickly (should be under 2 seconds). Whether the approval thread reads clearly. Whether the QA review experience feels natural.

---

### Demo Scenario C — "Signing a Change Control"
**Goal:** Show the Change Control signing experience.
**Who does this:** QA Manager + Engineering Manager (the two signatories).
**Time:** ~10 minutes

- [ ] Open the Change Control created at the end of Scenario B (or create one fresh).
- [ ] Walk through the diff viewer together — point out the red/green highlighting.
- [ ] Read the AI Delta Summary aloud. Ask: "Does this accurately describe what changed? Is it useful?"
- [ ] Engineering Manager signs first. Show the modal with their signature image. Confirm & Sign.
- [ ] **Live on QA Manager's screen:** The signature grid updates in real-time showing Engineering Manager has signed.
- [ ] QA Manager signs. Both signed.
- [ ] Show the SOP Library — the new version is now Active. The old version is Superseded.
- [ ] Open the Version History — show that both versions are preserved.

**Watch for:** Whether the diff viewer is readable and understandable to a non-technical user. Whether the AI summary is accurate and useful. Whether the signing flow feels appropriately formal and clear.

---

### Demo Scenario D — "Managing Equipment and Maintenance"
**Goal:** Show the PM Planner from submission through to task completion.
**Who does this:** Engineering Worker + QA Manager + Engineering Manager.
**Time:** ~15 minutes

- [ ] Engineering Manager clicks "Add Equipment". Fill in the form for a real piece of equipment from the client's operation.
- [ ] Submit it. Status shows Pending QA Approval.
- [ ] **QA Manager's screen:** Pulse notification arrives. QA opens and approves the equipment.
- [ ] **Engineering Worker's screen:** Equipment is now visible in the registry. Open the Asset Detail Sheet. Show the QR code.
- [ ] Navigate to the Calendar — the maintenance date is automatically on the calendar.
- [ ] Manually trigger a PM task alert (or have one pre-set as due today).
- [ ] Engineering Worker receives the PM alert in their Pulse. Clicks it. Opens the asset. Clicks "Log PM Completion". Fills in a note. Submits.
- [ ] Show the Service History in the Asset Detail Sheet — the completion is logged.
- [ ] Show the auto-calculated next due date.

**Watch for:** Whether the equipment approval flow feels necessary and clear (or like an obstacle). Whether the PM task workflow is simple enough for a floor-level worker. Whether the calendar integration makes sense to them.

---

### Demo Scenario E — "Sending an Urgent Notice"
**Goal:** Show the Notice system and real-time delivery.
**Who does this:** One Manager participant sending, everyone else receiving.
**Time:** ~5 minutes

- [ ] Manager clicks "Send Notice" in The Pulse.
- [ ] Types a subject and a short urgent message. Selects "Everyone".
- [ ] Sends it.
- [ ] **Everyone else's screens simultaneously:** The toast notification appears. Ask the group: "Everyone see that come through?"
- [ ] Each participant clicks Acknowledged.
- [ ] Manager watches the acknowledgement count climb in real-time.
- [ ] Manager deletes the notice. It disappears from all screens.

**Watch for:** Whether the real-time delivery is fast and reliable with multiple users. Whether the Acknowledged tracking feels useful. Whether anyone asks "can I send this to just one person?" — demonstrate that yes, you can.

---

### Demo Scenario F — "Reading the Audit Trail" (QA / Admin only)
**Goal:** Show the compliance and reporting capability.
**Who does this:** QA Manager or Admin participant.
**Time:** ~10 minutes

- [ ] Open Reports.
- [ ] Open the SOP Change History report. Find the procedure changed in Scenario B. Show the full thread — every submission, every comment, every approval with timestamps.
- [ ] Open the Worker Acknowledgement report. Show which staff have acknowledged the procedure.
- [ ] Open the PM Completion log. Show the maintenance task logged in Scenario D.
- [ ] Open the AI Risk Insights report. Read it together. Ask: "Is this a useful summary for your team?"
- [ ] Export one report as CSV. Open the file. Show it's clean data.
- [ ] Ask the group: "If an auditor walked in tomorrow and asked for evidence of this procedure change — how long would it take to produce it?" (Answer: seconds.)

**Watch for:** Whether the reports are readable and useful to a non-technical QA lead. Whether any expected data is missing. Whether the AI Risk Insights report generates anything meaningful given the limited demo data.

---

### End of Demo — Open Feedback Session

Run through these questions with the group and note the answers:

**Usability questions:**
- [ ] "Was there anything that felt confusing or unclear during the session?"
- [ ] "Is there anything you expected to be able to do that you couldn't find?"
- [ ] "How does the SOP reading experience compare to how you access procedures today?"
- [ ] "Does the Pulse give you the right information, or is there too much / too little?"
- [ ] "Would you feel confident showing this to the rest of the team?"

**Process questions:**
- [ ] "Does the QA approval flow match how your organisation actually approves document changes?"
- [ ] "Are the right people listed as signatories for Change Control?"
- [ ] "Is the equipment maintenance workflow realistic for your floor team?"

**Polish wishlist:**
Ask each participant: "If you could change one thing about the experience, what would it be?" Write every answer down regardless of feasibility.

---

### Section 2 — Issues & Polish Notes from Demo Session

| # | Scenario | Participant Role | Issue / Feedback | Priority |
|---|----------|-----------------|------------------|----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

---

*End of TEST.md*
