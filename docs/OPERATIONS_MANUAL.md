# Musicphonetics — Operations Manual

_Last updated: the current platform (performance, pricing, coupons, one-source onboarding, read-only teacher plans, Foundation progress card, owner settings)._

This is the practical, operator-facing guide: what Musicphonetics is, how the whole system works end to end, and exactly how you (the owner) run it day to day. For the deeper technical/data-model reference, see `docs/SYSTEM_OVERVIEW.md`.

---

## 1. What Musicphonetics is

A premium music-education company and its software platform. Families get structured lessons (guitar, piano, vocals, drums, violin, keyboard, ukulele and more) — at home, online, or at the South Delhi centre — with carefully matched teachers, a real curriculum, homework, attendance tracking and parent visibility.

The platform is three connected portals over one database:

- **Marketing site** — the public website + enrolment + the Delhi Cantt campaign.
- **Owner portal** (`/owner`) — you run the business here.
- **Teacher portal** (`/teacher`) — teachers run their day here.
- **Student/Parent portal** (`/parent`, branded "Student Portal") — families see progress, classes, fees.

---

## 2. How it's built (and why it stays up)

| Layer | What | Where |
|---|---|---|
| Website | Next.js, exported as static files | Cloudflare Pages |
| Server logic | Cloudflare Pages Functions | `functions/api/*` |
| Database + login + files | Supabase (Postgres, Auth, Storage) | Supabase project |
| Payments | Razorpay | `functions/api/razorpay/*` |
| Lead & notification email | Web3Forms (leads) · Resend (teacher offers) | server-side |

**Reliability:** every database request is now **time-bounded** (15s reads / 45s uploads). If the backend is slow or asleep, the portal fails fast and shows a **"Can't reach the server — Retry"** message instead of hanging. Each portal paints an **instant skeleton** while data loads, so it never shows a blank screen.

> **Free-tier note:** a free Supabase project **auto-pauses after ~7 days idle**. While paused, the portals can't load (the public marketing site and `/delhi-cantt` still work). If logins "fail to load," check the Supabase dashboard shows the project **Active**; resume it, wait a few minutes, hard-refresh. For a live business, put Supabase on a paid plan so it never pauses.

---

## 3. Programs & current pricing

| Program | Price | What it is |
|---|---|---|
| **Foundation** | **₹10,000 / month** | 32-class beginner journey — Explore → Play → Make Music → Perform. Visual progress card + optional monthly focus. |
| **Main Pathway** | **₹15,000 / month** | Ongoing structured development, guided by a fresh **monthly goal** the teacher sets. |
| **Director's Circle** | **By consultation** | Bespoke, director-guided. Owner-managed; hidden from ordinary teacher workflow. |

- Prices live in **one place**: `lib/pricing.ts`. To change a list price, edit it there and redeploy. Everything (website, enrolment, owner views) reads from it.
- **Historical payments are never rewritten** — old invoices keep the amount that was actually charged. New prices apply to new enrolments only.
- A **student's** program is set per-student by the owner under **Owner → Students → Program** (teachers can't change it).

---

## 4. Teacher lifecycle (one source of truth)

```
Apply → Owner review → Approve → Login + Offer → Onboarding → Portal (profile already filled) → Owner verifies sensitive items
```

1. **Apply** — a candidate fills the public **Teach With Us** form (`/teach-with-us`). It saves to `teacher_applications` and emails you.
2. **Review** — Owner → **Applications**. You see the full application (including bank details) before deciding.
3. **Approve** — one click runs the complete activation safely and **idempotently**:
   - Creates the Supabase **login** (a one-time temporary password).
   - **Fills the teacher's profile from the application** — legal/display name, phone, DOB, city, address, languages, instruments, regions, modes, experience, qualifications, and bank holder/name/IFSC/UPI (+ account last-4). The **full account number** goes to the private table.
   - **Seeds weekly availability** from the days × time-bands they gave (sensible default times they can adjust).
   - **Derives their onboarding checklist** so they open the portal to an accurate, mostly-complete state.
   - **Emails the offer letter + login** to the teacher.
4. **Portal** — the teacher signs in at `/teacher/login`. `/teacher/profile` is **already filled in** — they only complete genuinely-missing items (PAN, ID proof, photo, safeguarding & joining acknowledgements). It reads _"We've already filled in everything you shared when you joined."_
5. **Verify** — you review and approve sensitive items in Owner → **Teachers → (teacher) → Onboarding checklist**. If a teacher later edits a verified sensitive field, it re-enters review automatically.

> The **joining letter is an output** of the teacher's stored data — never the source. Nothing is parsed back out of a document.

---

## 5. Teacher coupons (commercial discounts)

**Codes only.** The owner creates a unique coupon code per teacher; the percent lives on the code; teachers can **see but never edit** it; the discount is **re-validated on the server** at payment.

- **Set it:** Owner → **Teachers → (teacher) → Teacher coupon**. Pick 10% / 20% (or a custom %), accept or edit the auto-suggested code (e.g. `ISAAC20`), Save. Deactivate any time.
- **How it applies:** on the enrolment/pay page a family can enter the code → sees the struck list price and the discounted monthly fee. `create-order` looks the code up server-side and caps the charge at the discounted price, so a discount can never be spoofed larger than the code grants.
- **What's recorded:** each payment stores **list price, discount %, discount amount, coupon code, and final amount**, so reports stay meaningful and historical revenue is never re-derived from today's prices.
- **Overview:** Owner → **Settings → Teacher commercial settings** lists every coupon (code · percent · active).

Example: Main Pathway ₹15,000 − 20% = **₹12,000**. Foundation ₹10,000 − 10% = **₹9,000**.

---

## 6. Student lifecycle

```
Enrol / Activate → Assigned teacher → Weekly classes → Attendance → Progress → Payments → Reports
```

- **Enrol:** families pay the first month on `/pay` (Razorpay, pro-rata for the start date), or start a guided enquiry on `/start`, or you add them directly. Leads arrive by email (Web3Forms).
- **Activate:** an existing/handed-over family uses **Student Activation** (`/activate`) with the `ACTIVATION_CODE` — this creates their **parent login** and links them to their student.
- **Assign a teacher / set the program:** Owner → **Students** (assign teacher, set **Program**, see codes, fees, parents).
- **Run classes:** the teacher adds students, records each **class update** (topic taught, homework, teacher notes, attendance) and **payments** in the teacher portal.
- **Progress:** derived automatically from **valid completed classes** — cancelled/rescheduled/non-counting classes never advance it.

---

## 7. Foundation journey (the 32-class card)

Foundation follows a fixed **32-class** journey in four stages of eight:

| Stage | Classes |
|---|---|
| 1. **Explore** | 1–8 |
| 2. **Play** | 9–16 |
| 3. **Make Music** | 17–24 |
| 4. **Perform** | 25–32 |

- **Progress is derived** from completed countable classes. Example: 18 completed = **56%**, Explore 8/8, Play 8/8, Make Music 2/8, Perform 0/8.
- The **teacher** updates the learning content per student (instrument-appropriate) under Teacher → Students → (student):
  - **Now Learning** — the current topic/skill.
  - **Songs Learned** — add/remove pieces.
  - **Next Milestone** — what's coming up.
- The **family** sees a premium, mobile-first **progress card** on the Student Portal (`/parent/progress`) — instrument, grade/journey title, X of 32 + %, the four stages, Now Learning, Songs Learned, Next Milestone. The same card (read-only + editors) shows to the teacher. It's reusable across instruments and ready for future grades.

---

## 8. Monthly goals (by program)

- **Foundation:** progress follows the curriculum; teachers may add an **optional monthly focus** (they don't pick a program each month).
- **Main Pathway:** the teacher **sets this month's goal** (e.g. _"Play complete G-family chord transitions and two strumming patterns confidently."_) → it appears instantly on the family's dashboard.
- **Director's Circle:** no teacher goal workflow (personally guided by the director).

Teachers **never** see a plan dropdown; the program is shown read-only ("set by the office").

---

## 9. Payments, discounts & payouts

- Families pay only through the official secure gateway, in the Musicphonetics name. Teachers **record** confirmed payments; they never collect directly.
- Revenue share: from each fee, ~3% is the payment-interface charge; of the net, the teacher gets **70%**, Musicphonetics **30%** (see the offer/joining letter).
- Every payment stores the **breakdown** (list / discount / final / coupon), so Owner → **Payments / Payouts / Reports** stay accurate regardless of price changes.

---

## 10. Monthly reports

Teacher drafts a report → submits → **owner reviews & publishes** (Owner → Reports) → the family sees it in the Student Portal. Nothing reaches a parent until you publish it.

---

## 11. Delhi Cantt campaign

A location-exclusive launch offer, separate from the core portals.

- **Page:** `/delhi-cantt` — a focused, premium landing page with the offer, a three-programme comparison, and a short lead form.
- **Offer:** Main Pathway **first month ₹10,000 instead of ₹15,000 (save ₹5,000)**, then ₹15,000/month. First-month only, Delhi-Cantt-only. Foundation & Director's shown for comparison.
- **Leads:** captured server-side (offer validated), delivered to your inbox, and optionally stored in `campaign_leads`.
- **Assets:** posters (`public/campaign/…` — portrait, square, link-preview) + a WhatsApp preview image. Source + render script live in `docs/campaign/`.
- **Control:** switch the whole offer on/off from one flag — `DELHI_CANTT.active` in `lib/delhi-cantt.ts`.
- **Share:** paste the UTM link + portrait poster into WhatsApp groups (ready-to-send copy in `docs/campaign/delhi-cantt.md`). The link shows a rich preview once deployed to the live domain.

---

## 12. Notifications & messages

- A **bell** in every portal shows unread items (polls quietly).
- **Director messages** (Owner → Messages) can be broadcast or targeted, and appear on the relevant dashboards.

---

## 13. Security model

- **Roles:** `owner`, `teacher`, and parent/student. Login is Supabase Auth; access is enforced by **Row-Level Security** in the database, not just the UI.
- Teachers only ever see their own students/payments; parents only their own child; owners see everything.
- **Sensitive data** (full bank number, PAN, ID/bank proof files) lives in a private table + private storage, shown to the owner masked-until-revealed, and never exposed to parents.
- **Secrets** (Supabase service-role key, Razorpay secret, Resend key) live **only** in Cloudflare environment variables — never in the browser bundle.

---

## 14. Owner "how do I…" playbook

| Task | Where |
|---|---|
| Approve a new teacher | Owner → **Applications** → Approve |
| Verify a teacher's ID/bank/PAN | Owner → **Teachers** → (teacher) → Onboarding checklist |
| Give a teacher a discount code | Owner → **Teachers** → (teacher) → Teacher coupon |
| Set/override a student's program | Owner → **Students** → Program column |
| Assign a teacher to a student | Owner → **Students** → Teacher column |
| Publish a monthly report | Owner → **Reports** |
| See all coupons / pricing at a glance | Owner → **Settings** |
| Change a list price | Edit `lib/pricing.ts` → redeploy |
| Turn the Delhi Cantt offer off | Set `DELHI_CANTT.active = false` in `lib/delhi-cantt.ts` → redeploy |
| Update a Foundation student's "Now Learning / Songs / Milestone" | Teacher does this in Teacher → Students |

---

## 15. Environment variables (Cloudflare Pages → Settings → Environment variables)

Set these for **both Production and Preview** (they're configured separately — a common cause of "Load failed" on preview).

**Browser (public — `NEXT_PUBLIC_` prefix required):**
- `NEXT_PUBLIC_SUPABASE_URL` — e.g. `https://<project>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the anon/public key

**Server / Functions (secret — never in the browser):**
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY`, `MAIL_FROM` _(optional — auto-emails teacher offers)_
- `WEB3FORMS_ACCESS_KEY` _(optional — falls back to a public key)_
- `ACTIVATION_CODE` — the code families use on Student Activation
- `DIRECTOR_TEACHER_ID` — default teacher for activated students
- `ALLOWED_ORIGIN_HOSTS` _(optional — restrict which origins may call public APIs)_

Env vars are baked in **at build time** for the browser ones — after changing them you must **redeploy** (a page refresh won't pick them up).

---

## 16. Database migrations (run in the Supabase SQL editor)

All are **additive and idempotent** — safe to run and re-run, nothing is dropped. Run any you haven't yet:

1. `supabase/musicphonetics_operations_upgrade.sql` — core ops (plans, payments, availability, `mp_is_owner()` helper, etc.)
2. `supabase/teacher_applications.sql` — teacher applications
3. `supabase/teacher_onboarding_v2.sql` — profile fields + private table + onboarding derive
4. `supabase/parent_and_curriculum.sql` — parent linkage + curriculum tables
5. `supabase/student_plan_goals.sql` — plan + monthly goal columns
6. `supabase/director_messages.sql` — director messages
7. `supabase/teacher_coupons.sql` — **coupons + payment price breakdown** ✅
8. `supabase/foundation_progress.sql` — **Now Learning / Songs / Next Milestone** ✅
9. `supabase/campaign_leads.sql` — _(optional)_ Delhi Cantt leads in the DB

---

## 17. Deploy & maintenance

- **Deploy:** push to the branch → Cloudflare Pages builds and deploys automatically (the new route + Functions are picked up). Preview deployments get their own env vars.
- **After any pricing/config change:** redeploy so the static build refreshes.
- **After any new `supabase/*.sql`:** run it once in Supabase.
- **Keep Supabase awake** (paid plan) for a live business.

---

## 18. Troubleshooting

| Symptom | Cause → Fix |
|---|---|
| Portal login/dashboard "Load failed" / won't load | Supabase paused → resume it; or Preview env vars missing → set `NEXT_PUBLIC_SUPABASE_*` on **Preview** and redeploy. |
| Portal spins forever | Now impossible — it times out to a Retry screen. If you see it, the backend is unreachable; check Supabase is Active. |
| Teacher asked to re-enter info | They were approved before the one-source-of-truth change — re-run isn't needed; new approvals auto-fill. Existing teachers just complete missing items once. |
| Coupon not discounting | Run `teacher_coupons.sql`; make sure the code is **Active**; codes are case-insensitive. |
| Foundation card empty (Now Learning/Songs/Milestone) | Run `foundation_progress.sql`; the teacher adds the content in Teacher → Students. |
| WhatsApp link shows no preview | Deploy to the live domain first; WhatsApp caches per-URL — share the UTM link or use the Facebook Sharing Debugger to re-scrape. |
| Payment rejected "amount does not match plan" | The server caps charges at the (coupon-adjusted) plan price — check the plan price in `lib/pricing.ts` and the coupon percent. |

---

_This manual reflects the platform after the six-phase upgrade: faster portals, current pricing (Foundation ₹10,000 / Main Pathway ₹15,000), teacher coupon codes, one-source-of-truth onboarding, read-only teacher programs, the Foundation progress card, and consolidated owner settings._
