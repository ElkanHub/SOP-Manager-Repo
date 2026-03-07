# SOP-Guard Pro — SECURITY.md
> **Security Implementation & Audit Checklist**
> This file covers every security requirement for SOP-Guard Pro to be production-ready
> and suitable for an industrial compliance environment.
> Two parts: (1) Implementation — things that must be built. (2) Audit — things you verify are working.

---

## CRITICAL CONTEXT

SOP-Guard Pro handles compliance documents, digital signatures, audit trails, and maintenance records for an industrial organisation. A security failure here is not just a technical problem — it is a regulatory and safety problem. The bar is higher than a typical web app.

The threat model is:
- **An employee trying to access another department's confidential procedures**
- **A worker trying to see unapproved drafts before QA signs off**
- **Someone trying to forge or backdating a digital signature**
- **An external attacker trying to access the system or its data**
- **An insider trying to modify or delete an audit record**

Every security measure below maps to one of these threats.

---

## PART 1 — IMPLEMENTATION CHECKLIST

Work through every item. Each one must be built and confirmed before the app goes to the client.

---

### 1.1 Authentication

- [ ] **Supabase Auth only.** No custom authentication logic anywhere. All signup, login, session management, and password reset flows go through `@supabase/ssr` and Supabase Auth exclusively.
- [ ] **Password strength enforcement.** Enforce minimum password requirements in Supabase Auth dashboard: minimum 8 characters, at least one uppercase letter, one number. Do not rely on frontend validation alone — Supabase enforces this server-side.
- [ ] **Email confirmation required.** In Supabase Auth settings, enable "Confirm email" so users cannot log in until their email address is verified. This prevents fake account creation.
- [ ] **Session expiry.** Set JWT expiry in Supabase Auth dashboard to 1 hour (3600 seconds). Set refresh token rotation to enabled. This means sessions auto-expire and refresh tokens cannot be reused after rotation.
- [ ] **Middleware session refresh.** The Next.js middleware (`middleware.ts`) must call `supabase.auth.getUser()` on every request to validate and refresh the session. Never use `getSession()` on the server — it reads from the cookie without server-side validation.
- [ ] **No service role key on the client.** `SUPABASE_SERVICE_ROLE_KEY` must only ever appear in server-side code (API routes, server components, server actions). It must never be in a `NEXT_PUBLIC_` variable. Audit every file containing this key.
- [ ] **Logout clears all tokens.** The logout action calls `supabase.auth.signOut()` with `{ scope: 'global' }` to invalidate all sessions across all devices, not just the current one.
- [ ] **Auth errors never leak details.** Login error messages must say "Invalid credentials" — not "Email not found" or "Wrong password". Distinguishing between the two helps attackers enumerate valid email addresses.

---

### 1.2 Row Level Security (RLS)

RLS is the primary security layer. The frontend is never trusted for access control. Every rule below must be enforced at the database level.

**General RLS rules:**
- [ ] **RLS is enabled on every single table.** Verify in the Supabase dashboard — the "RLS enabled" indicator must be green for all 13 tables. There must be no table with RLS disabled.
- [ ] **Default deny.** Every table's default policy is deny-all. Access is only granted by an explicit permissive policy. Never leave a table with no policies and RLS enabled — that denies all access including to the user themselves.
- [ ] **No `USING (true)` policies.** A policy with `USING (true)` grants access to everyone, including unauthenticated users. Search for this pattern and remove it.

**Per-table RLS policies — verify these exist and work:**

| Table | Worker Can | Manager Can | QA Manager Can | Admin Can |
|-------|-----------|-------------|----------------|-----------|
| `profiles` | SELECT/UPDATE own row only | SELECT/UPDATE own row only | SELECT all | SELECT/UPDATE all |
| `departments` | SELECT all | SELECT all | SELECT/UPDATE all | SELECT/UPDATE/INSERT all |
| `sops` | SELECT where `status = 'active'` AND `dept_id = own dept` | SELECT all in own dept | SELECT all depts | SELECT all |
| `sop_versions` | SELECT where parent SOP is active | SELECT all in own dept | SELECT all | SELECT all |
| `sop_approval_requests` | INSERT own, SELECT own | SELECT/INSERT own dept | SELECT/UPDATE all | SELECT all |
| `sop_approval_comments` | INSERT/SELECT on own requests | INSERT/SELECT on own dept requests | INSERT/SELECT all | SELECT all |
| `sop_acknowledgements` | INSERT/SELECT own rows | SELECT dept rows | SELECT all | SELECT all |
| `change_controls` | No access | SELECT/UPDATE own dept | SELECT/UPDATE all | SELECT all |
| `signature_certificates` | No access | INSERT own signature, SELECT own | SELECT all | SELECT all |
| `equipment` | SELECT active in own dept | SELECT/INSERT own dept | SELECT/UPDATE all | SELECT all |
| `pm_tasks` | SELECT/UPDATE assigned tasks in own dept | SELECT/INSERT own dept | SELECT all | SELECT all |
| `notices` | INSERT own, SELECT received | INSERT own, SELECT received | INSERT own, SELECT all | SELECT all |
| `events` | SELECT public + own dept | INSERT/SELECT own dept | INSERT/SELECT all | INSERT/SELECT all |
| `audit_log` | No access | No access | SELECT own dept | SELECT all |

- [ ] **The Gold Rule is enforced at RLS level.** For the `sops` table, the Worker SELECT policy must include `AND status = 'active'`. A Worker querying `sops` must never receive a row with `status = 'draft'`, `'pending_qa'`, or `'superseded'` — even if they construct the query directly against the API.
- [ ] **Cross-department isolation.** An Engineering Worker must not be able to read Logistics SOPs. Test this by querying the Supabase API directly with the Engineering Worker's JWT token and requesting Logistics SOPs. Zero rows should be returned.
- [ ] **QA global visibility is role-checked, not hardcoded.** The QA visibility policy uses the `get_user_dept_is_qa()` database function, not a hardcoded department name or ID. If the QA department is ever renamed or recreated, the policy still works.
- [ ] **`audit_log` is insert-only for all non-admin users.** Workers and Managers can trigger inserts (via server functions) but cannot SELECT, UPDATE, or DELETE audit records. This makes the audit trail tamper-resistant.
- [ ] **`signature_certificates` is immutable.** No UPDATE or DELETE policy exists for `signature_certificates`. Once a signature is recorded, it cannot be modified or removed by anyone — including Admins operating through the app.

---

### 1.3 API Route Security

Every API route in `/api/` must be secured independently. Never assume a route is protected just because the frontend requires login.

- [ ] **All API routes verify the session server-side.** Every API route must call `supabase.auth.getUser()` at the top and return `401 Unauthorized` immediately if no valid session exists. No exceptions.

```typescript
// Required pattern at the top of every API route handler
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

- [ ] **Role checks in API routes.** Routes that are Manager/QA/Admin-only must check the user's role from the database (not from a client-passed parameter) before proceeding.
- [ ] **Cron endpoints are secured with a secret header.** `/api/cron/pm-alerts` and `/api/cron/overdue-check` must require a `Authorization: Bearer [CRON_SECRET]` header. Set `CRON_SECRET` as an environment variable. Vercel Cron sends this header automatically when configured correctly. Without this, anyone can trigger these endpoints.

```typescript
// Required pattern for cron routes
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

- [ ] **Gemini API routes are server-only.** `/api/gemini/delta-summary` and `/api/gemini/risk-insights` must verify an authenticated session before calling Gemini. The `GEMINI_API_KEY` must never be exposed to the client.
- [ ] **Storage upload routes validate file type server-side.** The `/api/storage/sop-upload` route must verify the uploaded file is a valid `.docx` (check MIME type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Do not trust the file extension provided by the client. Malicious files disguised as `.docx` must be rejected.
- [ ] **Storage upload routes enforce file size limits.** Maximum 25MB per SOP upload. Return `413 Payload Too Large` if exceeded.
- [ ] **No sensitive data in API responses.** API responses must never include password hashes, service role tokens, internal IDs not relevant to the request, or other users' full profile data. Return only what is needed.

---

### 1.4 Input Validation & Injection Prevention

- [ ] **Zod validation on all form inputs.** Every form submission (SOP upload metadata, equipment form, notice composer, profile edit, onboarding) must be validated with a Zod schema on the server side before any database operation.
- [ ] **No raw SQL string construction.** All database queries use the typed Supabase client (`supabase.from(...).select(...).eq(...)`). Never concatenate user input into a SQL string. The Supabase client handles parameterisation automatically.
- [ ] **SOP content is rendered in a sandboxed div.** When mammoth.js converts `.docx` to HTML, that HTML is rendered inside a sandboxed container. Apply a strict CSS reset. Never use `dangerouslySetInnerHTML` without sanitising the HTML first — use `DOMPurify` to strip any `<script>` tags or event handler attributes from the converted HTML before rendering.

```typescript
import DOMPurify from 'dompurify';
const cleanHtml = DOMPurify.sanitize(mammothOutput.value, {
  ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'table', 'tr', 'td', 'th', 'br'],
  ALLOWED_ATTR: []
});
```

- [ ] **Notice content is sanitised.** Notice subject and message fields are plain text only. Strip any HTML tags before storing or displaying. Never render notice content as raw HTML.
- [ ] **File uploads stored with UUID filenames.** Files uploaded to Supabase Storage are stored with a UUID-based filename (`[uuid].docx`), never the user-provided filename. This prevents path traversal attacks and filename injection.
- [ ] **URL parameters are validated.** Any route that uses an ID from a URL parameter (e.g. `/sops/[id]`) must validate that the ID is a valid UUID before querying. Return `404` for invalid formats rather than passing them to the database.

---

### 1.5 Supabase Storage Security

- [ ] **Storage buckets are private by default.** The `sop-uploads`, `signatures`, and `avatars` buckets must NOT be set to public. Files are only accessible via signed URLs generated server-side.
- [ ] **Signed URLs for file access.** When a user needs to view a SOP or download a file, the server generates a short-lived signed URL (expiry: 60 minutes max) using `supabase.storage.from('sop-uploads').createSignedUrl(path, 3600)`. The raw storage path is never exposed to the client.
- [ ] **Storage RLS policies match database RLS.** Add storage policies so that a Worker from Engineering cannot request a signed URL for a Logistics SOP file even if they somehow know the file path.
- [ ] **Signature images are access-controlled.** `signatures/` bucket must only allow the owning user to read their own signature. QA Managers can read signatures for Change Control display. No other access.
- [ ] **Old file versions are retained, not deleted.** When a SOP is updated and a new version is uploaded, the old file must remain in storage (referenced by `sop_versions.file_url`). Never delete old SOP files — they are part of the audit record.

---

### 1.6 Environment Variables & Secrets

- [ ] **`.env.local` is in `.gitignore`.** Verify this. Run `git status` and confirm `.env.local` is not tracked. Check `git log` to confirm it was never committed in the past.
- [ ] **No secrets in client-side code.** Search the entire codebase for `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, and `CRON_SECRET`. None of these must appear in any file under `/app` or `/components` that runs in the browser. They must only appear in `/api/` routes or server components.
- [ ] **All required environment variables are documented.** The `.env.local.example` file (committed to git, no real values) lists every required variable so a new developer knows what to configure:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
```

- [ ] **Vercel environment variables are set for production.** In the Vercel dashboard, all six variables above are set under Settings → Environment Variables for the Production environment.
- [ ] **Supabase anon key is the only public key.** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is designed to be public — it is intentionally in the bundle. Its access is limited by RLS policies. Document this so future developers don't rotate it unnecessarily.

---

### 1.7 Digital Signature Integrity

The digital signature system is the most legally sensitive part of this application. Its integrity must be airtight.

- [ ] **Signatures are collected server-side only.** The signature recording logic (inserting into `signature_certificates`) must happen in a server action or API route — never a direct client-side Supabase insert. This allows the server to attach the IP address and validate the session.
- [ ] **IP address is captured server-side.** The IP address stored in `signature_certificates.ip_address` must come from the request headers on the server (`x-forwarded-for` or `x-real-ip`), not from a client-provided value. A client-provided IP can be spoofed.
- [ ] **Timestamp is server-generated.** `signature_certificates.signed_at` must default to `now()` at the database level. Never accept a timestamp from the client.
- [ ] **A user can only sign once per Change Control.** The `UNIQUE (change_control_id, user_id)` constraint on `signature_certificates` enforces this at the database level. The server must also return a clear error if a duplicate sign attempt is made.
- [ ] **The signature image shown in the modal is fetched from the database.** The signature image displayed in the `<SignatureConfirmModal />` must be fetched from `profiles.signature_url` via the server — not passed as a prop from client state. This ensures the signature used is the one on record, not a substituted one.
- [ ] **Completed Change Controls are immutable.** Once `change_controls.status = 'complete'`, no UPDATE policy should allow further changes to that row. The RLS policy for `change_controls` must check this status.
- [ ] **Audit log entry is created for every signature.** Every `signature_certificates` insert must trigger an `audit_log` entry with `action = 'signed_change_control'`, the user's ID, the Change Control ID, and the timestamp.

---

### 1.8 Audit Log Integrity

- [ ] **Audit log inserts are triggered server-side.** Audit log entries are written by Supabase database triggers or server-side functions — not by client-side code. Client code cannot be trusted to reliably write its own audit trail.
- [ ] **No UPDATE or DELETE on `audit_log`.** The RLS policy for `audit_log` must include zero UPDATE and zero DELETE policies for any role. The service role key (used by server functions) is the only way to write to this table, and it bypasses RLS — so the application code must never issue UPDATE/DELETE on `audit_log` directly.
- [ ] **Every critical action is logged.** Verify an audit log entry is created for each of the following:

| Action | Logged? |
|--------|---------|
| User signs up | [ ] |
| User completes onboarding | [ ] |
| SOP submitted for QA review | [ ] |
| QA approves a submission | [ ] |
| QA requests changes | [ ] |
| Change Control issued | [ ] |
| Manager signs a Change Control | [ ] |
| Change Control completed | [ ] |
| SOP version goes Active | [ ] |
| Worker acknowledges a SOP | [ ] |
| Equipment added | [ ] |
| Equipment approved by QA | [ ] |
| PM task completed | [ ] |
| Notice sent | [ ] |
| Notice acknowledged | [ ] |
| User role changed by Admin | [ ] |

---

### 1.9 HTTP & Transport Security

- [ ] **HTTPS only.** Vercel enforces HTTPS by default. Confirm the Vercel project has "Force HTTPS" enabled. No HTTP traffic should be served.
- [ ] **Security headers.** Add the following HTTP security headers via `next.config.ts`. These are not optional for a compliance-grade application:

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // tighten this post-MVP
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
    ].join('; ')
  },
];
```

- [ ] **`X-Frame-Options: SAMEORIGIN`** prevents the app from being embedded in an iframe on another site (clickjacking protection).
- [ ] **`X-Content-Type-Options: nosniff`** prevents browsers from MIME-sniffing — important since the app serves `.docx` files and other binary formats.
- [ ] **Supabase redirect URLs are locked down.** In Supabase Auth settings → URL Configuration, the allowed redirect URLs must be an explicit list. Never use a wildcard (`*`). Only include:
  - `http://localhost:3000/**` (development)
  - `https://your-production-domain.vercel.app/**` (production)
  - The client's final custom domain once confirmed

---

### 1.10 Rate Limiting & Abuse Prevention

- [ ] **Supabase Auth rate limiting is enabled.** Supabase Auth has built-in rate limiting on signup and login endpoints. Verify in the Supabase dashboard that these are not disabled.
- [ ] **File upload rate limiting.** Add Vercel's built-in rate limiting to the `/api/storage/sop-upload` route, or implement a simple token-bucket check using Redis/Upstash if needed. A user should not be able to upload hundreds of files in seconds.
- [ ] **Gemini API calls are debounced.** The delta summary and risk insights Gemini calls are cached with React Query (`staleTime: 5 * 60 * 1000`). If the cache is warm, no new API call is made. This prevents accidental or malicious re-triggering of expensive AI calls.
- [ ] **Notice sending is rate-limited.** A user should not be able to send more than 20 notices in a 10-minute window. Implement a simple check server-side: count recent `notices` rows by `sender_id` within the window before inserting.

---

### 1.11 Data Privacy

- [ ] **Employees can only see their own signature.** The signature image stored in Supabase Storage under `signatures/` must only be readable by the owning user and by the server. No other user can access another user's raw signature file via a direct URL.
- [ ] **Profile data is scoped by role.** Workers can see their own profile. Managers can see names and roles within their department (needed for assignment and display). Full profile data (employee ID, phone, signature URL) is not exposed in any list view.
- [ ] **Deleted users are handled gracefully.** If an Admin deactivates a user account, their historical audit log entries, acknowledgement records, and signature certificates must remain intact — these are compliance records. Only future access is blocked, not historical records.
- [ ] **No PII in logs.** Vercel and Supabase function logs must not contain personally identifiable information. Do not log full user objects, email addresses, or signature URLs in console statements. Log user IDs only.

---

## PART 2 — SECURITY AUDIT CHECKLIST

Run these checks manually after completing all implementation items. These are the verification tests.

---

### 2.1 Authentication Bypass Tests

> For each test: attempt the action without a valid session. Expected result: `401` or redirect to `/login`.

- [ ] **Direct URL access.** Open a fresh private/incognito browser window. Navigate directly to `/dashboard`, `/sops`, `/equipment`, `/qa/approvals`, `/reports`, `/settings`. Every route must redirect to `/login`.
- [ ] **API route without session.** Using a tool like curl or Postman, send a POST request to `/api/gemini/delta-summary` with no Authorization header. Expected: `401 Unauthorized`.
- [ ] **Cron route without secret.** Send a GET request to `/api/cron/pm-alerts` with no `Authorization` header. Expected: `401 Unauthorized`.
- [ ] **Expired session.** Log in. In Supabase Auth dashboard, manually revoke the user's refresh token. Attempt to navigate within the app. Expected: redirect to `/login`.
- [ ] **Onboarding bypass.** Create a new account but do not complete onboarding. Attempt to navigate to `/dashboard` directly. Expected: redirect to `/onboarding`.

---

### 2.2 RLS Penetration Tests

> These tests attempt to access data across role and department boundaries. Every test should return zero rows or an error — never real data.

- [ ] **Worker reads draft SOP.** Log in as `eng.worker@test.com`. Using the Supabase client in the browser console, run:
  ```javascript
  const { data } = await supabase.from('sops').select('*').eq('status', 'draft');
  console.log(data); // Must be [] or null
  ```
- [ ] **Engineering Worker reads Logistics SOPs.** As `eng.worker`, query `sops` without a department filter. The response must only contain Engineering SOPs — never Logistics or any other department.
- [ ] **Worker reads Change Control.** As `eng.worker`, query `change_controls` directly. Expected: empty array.
- [ ] **Worker reads audit log.** As `eng.worker`, query `audit_log` directly. Expected: empty array or permission error.
- [ ] **Worker reads another user's profile.** As `eng.worker`, query `profiles` with a filter for `logistics.worker@test.com`'s user ID. Expected: empty array.
- [ ] **Manager signs without being a required signatory.** Manually attempt to insert a row into `signature_certificates` for a Change Control that does not require that Manager's signature. The server function must reject this.
- [ ] **Non-QA accesses QA approvals page.** Log in as `eng.manager`. Navigate to `/qa/approvals`. Expected: redirect or 403 error page.
- [ ] **Non-Admin accesses user management.** Log in as `eng.manager`. Navigate to `/settings`. Expected: Departments and Users tabs are not present in the UI. Attempt a direct API call to list all users — expected: only own profile returned.

---

### 2.3 File Upload Security Tests

- [ ] **Wrong file type rejected.** Attempt to upload a `.txt`, `.pdf`, and a `.exe` file disguised as `.docx` (rename an `.exe` to `.docx`). All must be rejected server-side with a clear error message.
- [ ] **Oversized file rejected.** Attempt to upload a file larger than 25MB. Expected: `413 Payload Too Large` error.
- [ ] **Malicious HTML in docx rejected.** Create a `.docx` file containing an embedded `<script>alert('xss')</script>` tag in the body. Upload and open it in the viewer. The script must not execute — DOMPurify must strip it.
- [ ] **Filename preserved as UUID.** Upload any SOP file. Check Supabase Storage. The stored filename must be a UUID, not the original filename provided by the client.

---

### 2.4 Signature Integrity Tests

- [ ] **Cannot sign twice.** As `eng.manager`, sign a Change Control. Attempt to sign the same Change Control again (either via UI or direct API call). Expected: unique constraint error, no duplicate row in `signature_certificates`.
- [ ] **Cannot sign for another user.** Attempt to insert a `signature_certificates` row with a `user_id` that is not the currently authenticated user. Expected: RLS policy rejection.
- [ ] **Signature timestamp is server-generated.** Inspect the `signed_at` value in `signature_certificates` after signing. It must match the server time — not any timestamp passed from the client.
- [ ] **Completed CC is immutable.** After a Change Control is completed, attempt to update its `status` or `delta_summary` via a direct Supabase query. Expected: RLS policy rejection.

---

### 2.5 Security Header Verification

- [ ] **Check headers in production.** Open the production URL in a browser. Open DevTools → Network → click the main document request → check Response Headers. Verify all of the following are present:
  - `Strict-Transport-Security`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Content-Security-Policy`
- [ ] **Run securityheaders.com scan.** Visit `https://securityheaders.com` and enter the production URL. Target grade: **A or B minimum**. Fix any flagged items.
- [ ] **No mixed content.** Open DevTools Console on any page. Confirm zero "Mixed Content" warnings (HTTP resources loaded on an HTTPS page).

---

### 2.6 Secrets & Environment Audit

- [ ] **No secrets in git history.** Run `git log --all --full-history -- .env*` — no `.env.local` or `.env` files should appear in the log. Also run a search: `git grep -i "service_role"` — must return zero results in any tracked file.
- [ ] **No secrets in the client bundle.** Run `npm run build`. Open `.next/static/chunks/` and search the JS files for `service_role`, `GEMINI_API_KEY`, and `CRON_SECRET`. None must appear.
- [ ] **Vercel environment variables are not exposed.** In Vercel deployment logs, confirm secret environment variables are redacted (shown as `***`).

---

### 2.7 Dependency Audit

- [ ] **Run `npm audit`.** Run `npm audit --audit-level=high` and resolve all HIGH and CRITICAL severity vulnerabilities. Document any that cannot be immediately resolved.
- [ ] **No unused dependencies.** Run `npx depcheck`. Remove any unused packages — each unused dependency is a potential attack surface.
- [ ] **Lock file committed.** `package-lock.json` (or `pnpm-lock.yaml`) is committed to git. This ensures reproducible, auditable installs.

---

### 2.8 Final Pre-Launch Security Sign-Off

Before handing the system over to the client, confirm every item below:

- [ ] All PART 1 implementation items are complete
- [ ] All PART 2 audit tests have passed
- [ ] `npm audit` shows zero HIGH or CRITICAL vulnerabilities
- [ ] Security headers verified on production URL with grade A or B
- [ ] No secrets found in git history or client bundle
- [ ] RLS penetration tests all returned zero unauthorised data
- [ ] Signature integrity tests all passed
- [ ] File upload validation working server-side
- [ ] Cron endpoints secured with `CRON_SECRET`
- [ ] Supabase redirect URLs are an explicit list (no wildcards)
- [ ] Vercel HTTPS enforced
- [ ] Audit log verified to be append-only (no delete policies)

---

## PART 3 — ONGOING SECURITY (Post-Launch)

These are not one-time checks — they are recurring responsibilities once the system is live.

| Task | Frequency | Owner |
|------|-----------|-------|
| Run `npm audit` and update vulnerable packages | Monthly | Developer |
| Review Supabase Auth logs for unusual login patterns (multiple failed attempts, logins from unknown locations) | Weekly | Admin |
| Rotate `CRON_SECRET` and `GEMINI_API_KEY` | Every 6 months | Developer |
| Review and prune user accounts (offboarded employees still active) | Monthly | Admin |
| Verify Supabase backups are running | Monthly | Admin |
| Review RLS policies after any schema migration | Every migration | Developer |
| Check Vercel deployment logs for unexpected errors or access patterns | Weekly | Developer |
| Re-run securityheaders.com scan after any `next.config.ts` change | After every config change | Developer |

---

## APPENDIX — QUICK REFERENCE: WHAT EACH SECURITY LAYER PROTECTS

| Layer | What It Stops |
|-------|--------------|
| Supabase Auth + session validation | Unauthenticated access to any part of the app |
| Row Level Security (RLS) | Cross-department data leakage, workers seeing draft SOPs, privilege escalation |
| Server-side role checks in API routes | Frontend manipulation to access admin/QA functions |
| Zod validation | Malformed data, injection attempts through form inputs |
| DOMPurify on docx content | XSS attacks embedded in uploaded Word documents |
| UUID filenames in Storage | Path traversal, filename injection attacks |
| Private storage buckets + signed URLs | Direct access to SOP files without authentication |
| Signature timestamp from server | Backdated or future-dated signature forgery |
| Unique constraint on signature_certificates | Signing a Change Control multiple times |
| Append-only audit_log | Tampering with or deleting compliance records |
| HTTP security headers | Clickjacking, MIME sniffing, cross-site data leakage |
| No secrets in client bundle | API key theft from browser DevTools |
| Cron secret header | Unauthorised triggering of background jobs |

---

*End of SECURITY.md*
