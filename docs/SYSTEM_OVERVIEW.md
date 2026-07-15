# Musicphonetics — System Overview

> A single reference that explains how the whole Musicphonetics platform works —
> product, flows, data, payments, documents, security, tech stack and wireframe.
> Written to be handed to another assistant (ChatGPT etc.) for a sanity check.

---

## 1. What Musicphonetics is

Musicphonetics is a structured music-education company (Delhi NCR + online),
founded by **Abhishek Kumar**. The platform is a premium marketing website plus
three private portals:

- **Owner** portal — the founder/office runs the whole operation.
- **Teacher** portal — teachers manage their students, class updates, payouts.
- **Student/Parent** portal — families follow progress, goals, class notes, fees.

The teaching model has three batches (plans):

| Plan | Price (monthly) | What it is |
|------|-----------------|------------|
| **Foundation** | ₹8,000 | 32-class beginner pathway (4 chapters × 8). Has a curriculum progress bar. |
| **Main Pathway** | ₹12,000 | Ongoing structured growth. No progress bar; a teacher-set **monthly goal** instead. |
| **Director's Circle** | Bespoke | Personally guided by the founder. No progress bar, no monthly goal. |

---

## 2. Tech stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- **Build/output:** **static export** (`output: "export"`). There are **no**
  Next.js server routes — every page is static HTML/JS.
- **Hosting:** Cloudflare Pages.
- **Backend (server logic):** **Cloudflare Pages Functions** at
  `/functions/api/*.js` (plain JS, run at the edge). These are the only
  server-side code.
- **Database + Auth:** **Supabase** (Postgres + GoTrue auth + Row-Level
  Security). Accessed from the browser via the anon key (RLS-protected) and from
  Functions via the service-role key (server-only).
- **Payments:** **Razorpay** (Standard Checkout). A universal pay link
  `https://razorpay.me/@musicphonetics` is also used for ad-hoc/renewal payments.
- **Transactional email:** **Resend** (teacher onboarding emails).
- **Owner notifications:** **Web3forms** (emails the owner form submissions; it
  can only email the form owner, never arbitrary recipients).

> Note: `functions/api/cashfree/` and some `CASHFREE_*` env references are legacy
> from an earlier payment provider. The live provider is Razorpay. The provider
> name is intentionally kept out of all user-facing copy.

---

## 3. Roles, portals & routes

### Marketing site (`app/(site)/`)
`/` home · `/founder` · `/method` · `/curriculum` · `/standards` · `/trust` ·
`/centre` · `/programmes/[slug]` · `/reviews` · `/teachers` (+ `/teachers/[slug]`) ·
`/open-mic` (stage event) · `/teach-with-us` (teacher application) ·
`/pay` (checkout) · `/welcome` (post-payment) · `/activate` (student activation) ·
`/enrolment-agreement` (parent legal doc) · `/contact` · `/support`.

### Owner portal (`app/owner/`)
`dashboard` · `students` · `teachers` · `applications` · `messages` (director
notes) · `payments` · `payouts` · `reports` · `login`.

### Teacher portal (`app/teacher/`)
`dashboard` · `students` · `add-student` · `class-update` · `payments` ·
`profile` · `login`.

### Student/Parent portal (`app/parent/`) — branded "Student Portal"
`dashboard` · `classes` · `progress` · `reports` · `payments` · `login`.
(Routes stay under `/parent/*`; the visible label is "Student Portal".)

---

## 4. Data model (Supabase Postgres, key tables)

- **profiles** — one row per auth user. `role ∈ {owner, teacher, parent}`,
  name, phone, email, instruments, regions, experience, qualifications,
  bank/UPI, status.
- **students** — the learner record. `teacher_id` (assigned teacher),
  `parent_id` (the login that owns it), name, instrument, class day/time/mode,
  `fee_quoted`, `classes_per_month`, status. **Plan/goal columns** (migration
  `student_plan_goals.sql`): `plan` (`foundation|main|directors`),
  `monthly_goal`, `goal_month`, `goal_set_at`.
- **class_updates** — one row per class the teacher logs (what was taught,
  homework, response, next-class date, notes). Progress is **derived** from
  these, never duplicated.
- **payments** — money received per student (amount, status, date; teacher/
  company share are generated columns).
- **payouts** — teacher settlement records.
- **teacher_applications** — public "Apply to teach" submissions the owner
  reviews (`teacher_applications.sql`).
- **director_messages** — founder notes shown to parents as forced
  notifications (`director_messages.sql`).
- **parent_feedback** — parent ratings/reviews.
- **community_updates** — anonymised headlines shown in the portal.

**RLS model:** parents read only their own students/updates/payments; teachers
read/write their own students; the owner reads via owner-only Functions
(service role) or owner-scoped policies. The service-role key lives only in
Functions, never in the browser.

---

## 5. Enrolment flow (new student)

Every enrolment runs the **same loop, every time**:

1. **Choose a programme** — `/programmes/[slug]` → "Enrol" → `/pay?plan=&amt=`.
2. **Step 1 — details** — student name, instrument, level, mode, preferred
   days, start date. Fees are **pro-rated** to the calendar month from the start
   date.
3. **Step 2 — terms before paying** — the full schedule, fees and refund policy
   are shown, linking the **Enrolment Agreement & Parent Acknowledgement**
   (`/enrolment-agreement`). A **required checkbox** confirms the family read and
   agreed, and states that **no login is issued at payment**.
4. **Payment** — Razorpay Standard Checkout. Order created server-side
   (`/api/razorpay/create-order`) and verified server-side
   (`/api/razorpay/verify-payment`); the secret key never reaches the browser.
   The enrolment details are saved to `localStorage` before checkout.
5. **Success → `/welcome`** — "Welcome to the family", a printable **Enrolment
   Confirmation** document that **restates the agreed terms with the timestamp**,
   and a prominent **"Activate your Student Portal"** step.
6. **No login is created at payment — not even temporary.** The family must go to
   **Student Activation** to create their own login.

---

## 6. Student Activation flow (`/activate`)

Existing/enrolled students self-activate:

1. Family opens `/activate`, enters student/parent/WhatsApp/email/instrument and
   a **batch access code**, and ticks the acknowledgement (links the Enrolment
   Agreement; enforced server-side).
2. `POST /api/activate-student` (public, gated by `ACTIVATION_CODE`):
   - Creates a Supabase auth user (email, or a synthetic
     `s<phone>@students.musicphonetics.com` if no email) with an **easy
     password** (e.g. `guitar-4821`) and `role: parent`.
   - Stamps `profiles.role = parent`.
   - Creates the linked **students** row (`parent_id` = new user;
     `teacher_id` = `DIRECTOR_TEACHER_ID` or the owner as fallback) and stamps
     **`plan = 'directors'`** (best-effort, so it can't break if the column is
     missing).
   - Records the acknowledgement in the user metadata.
3. The login id + password are shown **once on screen** to copy; the family signs
   in at `/parent/login`.

---

## 7. Teacher onboarding flow

1. **Apply** — `/teach-with-us` → `POST /api/teacher-application` (public).
   Stores the application in `teacher_applications` **and** emails the owner the
   full application incl. bank details (Web3forms). **No login is created.**
2. **Owner reviews** — Owner portal → **Applications** → opens the full
   application → **Approve**.
3. `POST /api/approve-teacher` (owner-only):
   - Creates the Supabase teacher login with a temporary password.
   - Fills the teacher's `profiles` row from the application.
   - Marks the application `approved`.
   - **Emails the teacher** (Resend) their **Offer** + the **full Joining
     Agreement (all clauses) + declaration + login details**. Approval still
     succeeds if email isn't configured; the owner panel shows whether it sent.
4. **Owner prints/shares docs** — the Applications screen toggles between the
   printable **Offer Letter** and **Joining Agreement** for that teacher.
5. **Assign students** — Owner → Students → per-student **"Assign a teacher"**
   dropdown → `POST /api/assign-teacher` (owner-only) sets `students.teacher_id`.
   The student now appears in that teacher's portal.
6. **Teacher works** — logs in at `/teacher/login`, manages students, logs class
   updates, sets each student's **plan + monthly goal**, sees payouts.

Faculty public profiles live at `/teachers/[slug]` (shareable before trials; the
public grid stays hidden until 10 teachers are published).

---

## 8. Progress & monthly goals (plan-aware)

Classification: `studentPlan(student)` uses the explicit `plan` column when set;
otherwise infers from fee (`< ₹12,000` → Foundation, else Main). It **never**
infers "directors" — that is set explicitly.

- **Foundation:** curriculum **progress bar** (derived from completed
  `class_updates`) **+** this month's goal.
- **Main Pathway:** **monthly goal only** (no progress bar).
- **Director's Circle:** neither — a bespoke "personally guided" card.

Teachers set the plan and the rolling monthly goal from **My Students**. The
family sees the current month's goal in the Student Portal (dashboard +
progress). Skill-indicator bars are Foundation-only.

---

## 9. Payments & revenue model

- Fees are collected **only** through the official Musicphonetics Razorpay
  account. Teachers/parents must never transact privately.
- **Money split:** from each fee the payment interface deducts **~3%** as the
  gateway charge; from the **net settled amount**, the **teacher keeps 70%** and
  **Musicphonetics keeps 30%**.
  - Example: ₹4,000 fee → ~₹120 charge → ₹3,880 net → teacher ₹2,716 / MP ₹1,164.
- **Pro-rata:** first payment is pro-rated to the remaining days of the calendar
  month; thereafter a flat monthly fee on the 1st. 8 classes per cycle, to be
  completed within 35 days.
- **Payouts:** processed after the payment is received, settled and verified;
  paid only to the teacher's registered account.

---

## 10. Documents & legal clauses

- **Offer Letter** (`components/teach/OfferLetter.tsx`) — printable A4; identity,
  profile, engagement model, the **3% → 70/30** fee math with a worked example,
  payout account, responsibilities, safeguarding, confidentiality,
  non-solicitation, portal access, signatures.
- **Joining Agreement** (`components/teach/JoiningLetter.tsx`) — the binding
  contract: independent-contractor status, fees, **verification is good-faith not
  a guarantee**, **liability & indemnity** (teacher solely responsible for their
  own acts incl. theft/damage/unauthorised recording; indemnifies MP),
  confidentiality, IP/recordings, safeguarding, non-solicitation (6 months),
  termination for cause, governing law (India, Delhi NCR), declarations,
  signatures. Emailed to the teacher on approval and printable in the owner panel.
- **Enrolment Agreement & Parent Acknowledgement** (`/enrolment-agreement`) —
  public, readable/printable: fees & pro-rata, **teacher verification is not a
  guarantee**, **MP is not liable for a teacher's independent wrongful acts**
  (e.g. theft/misconduct — the claim lies against that individual), safety, no
  side arrangements, media consent, privacy. Every parent acknowledges it at
  enrolment (checkbox, enforced) and at activation.
- **Enrolment Confirmation** (`/welcome`) — restates the agreed terms with
  timestamp; points to Student Activation for the login.

The liability principle throughout: **Musicphonetics verifies teachers to the
best of its ability but does not guarantee anyone's conduct; an individual's
wrongful act is that individual's responsibility.**

---

## 11. Backend Functions (`/functions/api/`)

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `activate-student` | public + access code | Create student login + linked record (plan=directors). |
| `teacher-application` | public | Store application + email owner. |
| `approve-teacher` | owner | Create teacher login, fill profile, email offer+joining. |
| `assign-teacher` | owner | Set `students.teacher_id`. |
| `provision-parent` / `provision-teacher` | owner | Manual account provisioning helpers. |
| `send-invite` | owner | Supabase invite link (needs SMTP). |
| `razorpay/create-order` | public | Create a Razorpay order (secret server-side). |
| `razorpay/verify-payment` | public | Verify the payment signature. |

Owner-only Functions verify the caller's Supabase access token and check
`profiles.role === 'owner'` (`assertOwner`).

---

## 12. Environment variables

**Browser (public):** `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`,
`NEXT_PUBLIC_OWNER_PASSWORD` (owner login gate).

**Functions (server-only):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`ACTIVATION_CODE`, `DIRECTOR_TEACHER_ID`, `RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`, `WEB3FORMS_ACCESS_KEY`.

**Manual SQL migrations** (run once in Supabase): `parent_and_curriculum.sql`,
`teacher_applications.sql`, `director_messages.sql`, `student_plan_goals.sql`.

---

## 13. Wireframe / sitemap

```
Marketing site
  Home ─ Programmes ─ Method/Curriculum/Standards ─ Trust ─ Teachers ─ Open Mic
    │
    ├─ Enrol:  /programmes/[slug] → /pay (details → terms+agree → Razorpay) → /welcome
    │                                                                   └→ /activate (get login)
    ├─ Teach:  /teach-with-us → (owner Applications → Approve → email) → /teacher/login
    └─ Legal:  /enrolment-agreement

Portals (Supabase auth)
  Owner    /owner/*     dashboard · students(assign) · teachers · applications ·
                        messages · payments · payouts · reports
  Teacher  /teacher/*   dashboard · students(plan+goal) · add-student ·
                        class-update · payments · profile
  Student  /parent/*    dashboard(progress/goal) · classes · progress · reports · payments
```

**Key screens:**
- `/pay` — 2-step: details → terms + required agreement → Razorpay checkout.
- `/welcome` — success, printable confirmation (terms restated), activate CTA.
- `/activate` — access-code form → login id + password shown once.
- Owner `applications` — review → approve (auto-email) → print Offer/Joining.
- Owner `students` — assign teacher; Teacher `students` — set plan + monthly goal.
- Student `dashboard` — progress bar (Foundation) / monthly goal (Foundation+Main)
  / bespoke card (Director's Circle), next class, last update, fees, feedback,
  director notification.

---

## 14. End-to-end summary (one paragraph)

A family picks a plan on the marketing site, fills their details, **reads and
agrees to the Enrolment Agreement**, pays via Razorpay (order created and
verified by edge Functions), and lands on a **welcome page that restates the
agreement and tells them no login is issued — they must self-activate**. They go
to **Student Activation**, enter a batch access code, and receive a login to the
**Student Portal**, where they follow progress (a curriculum bar for Foundation,
a teacher-set monthly goal for Foundation/Main, or a bespoke plan for Director's
Circle), class notes, goals and fees. Teachers **apply** publicly; the **owner
approves**, which creates their login and **emails them the Offer + full Joining
Agreement**; the owner **assigns students**, and teachers then log classes and
set monthly goals. Money from each fee has **~3% interface charge removed, then
splits 70/30** teacher/company. Legal documents make clear that **verification is
good-faith, not a guarantee, and that Musicphonetics is not liable for a
teacher's independent wrongful acts** — protecting the company while keeping the
family and teacher relationship documented and accountable.
