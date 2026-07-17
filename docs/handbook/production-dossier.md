# Musicphonetics — Student &amp; Parent Enrollment Handbook
## Production Dossier

*Edition 2026 · v1.0 · Prepared 17 July 2026*

This dossier accompanies two print-ready design files in this folder:

| File | What it is | Pages |
|---|---|---|
| `enrollment-handbook.html` | The full premium A4 magazine-brochure | 26 (cover + 24 + back) |
| `newspaper-insert.html` | The condensed newspaper-insert edition | 4 (A4) |

Both are **self-contained** (the real Musicphonetics wordmark, founder photo and a live WhatsApp QR are embedded as data URIs — nothing loads from the network except the Fraunces/Hanken webfonts, which degrade gracefully to Georgia / system-ui). Open either file in Chrome and choose **Save / Print → Save as PDF** to produce the distributable PDF. A4, margins already built in.

> **A note on honesty.** Everything factual in these files was pulled from this repository — the live source of truth — not invented. Where a fact needed a founder’s call, it is marked as an **Open Decision** here and shown inline in the artwork with a discreet gold “Founder decision” marker. Screenshots and testimonials are represented by labelled frames, because they must be captured from live demo accounts and approved before print — see the registers below.

---

## Deliverable 1 — Live Brand &amp; Content Audit

**Confirmed from the repository (safe to print):**

| Item | Value | Source |
|---|---|---|
| Company | Musicphonetics | `lib/data.ts` |
| Founder | Abhishek Kumar (Founder · guitarist, vocalist, educator) | `lib/founder.ts` |
| Positioning | Education-first music company; structured learning across cities | `lib/data.ts` |
| Track record | 10+ years teaching · 1,100+ one-to-one students | `lib/founder.ts` |
| Region / modes | Delhi NCR home classes + online anywhere; South Delhi centre | `programs`, `centre` pages |
| WhatsApp / Phone | **+91 87961 99188** | `lib/data.ts` |
| Payments | razorpay.me/@musicphonetics (company-name) | `lib/data.ts` |
| Instagram | **@abhisheksessions** | `lib/data.ts` (see Open Decisions) |
| Plans &amp; prices | Foundation **₹8,000/mo** · Main Pathway **₹12,000/mo** · Director’s Circle (bespoke) | `lib/plan.ts`, `lib/foundation.ts` |
| Foundation pathway | 32 classes · 4 chapters (Starting Right → Ready for Next Level) | `lib/foundation.ts` |
| Verified instruments | Guitar, Piano/Keyboard, Vocals (Western &amp; Hindustani), Ukulele, Drums, Cajon, Violin | `lib/data.ts` faculty, `lib/programs.ts` |
| Learning paths | One-to-One, Online, Trinity Prep, Director’s Circle; Group/Academy &amp; Workshops = roadmap | `programs` page |
| Portal features (built) | Attendance, homework, monthly goals, progress bar, monthly reports, notifications, invoices/receipts | Owner/Teacher/Parent portals |
| Teacher onboarding | 7-stage standard (application → verification → safeguarding → joining agreement → portal → accountability) | `standards`, teacher onboarding system |
| Brand colours | Ink `#161B26`, Gold `#C9A227`/`#A8851B`, gold-on-light text `#7A5E0F`, Paper `#F6F4EF`, Forest `#2C4636` | `tailwind.config.ts` |
| Typefaces | Fraunces (display serif) + Hanken Grotesk (body) | `tailwind.config.ts` |
| Logo assets | `public/logo-wordmark-light.webp`, `logo-wordmark-dark.webp`, `Logo main.png` (2172×724) | `public/` |

**Contradictions / gaps found (resolved in favour of the live system):**

1. **Plan name.** The brief calls the middle tier *“Transformation”*; the live system calls it **“Main Pathway.”** → Used *Main Pathway* + flagged.
2. **Instagram handle.** `lib/data.ts` = `@abhisheksessions`; `lib/founder.ts` socials = `@musicphonetics`. → Used `@abhisheksessions` (the one wired into the live site) + flagged.
3. **Students-taught figure.** `1,100+` (founder) vs `1,000+` (trust strip). → Used **1,100+** (the founder’s own number).
4. **Instrument list.** The brief lists many instruments (sax, flute, tabla, harmonium, bass). Only **7** have verified faculty/programme evidence. → Printed only the verified list + Open Decision to add more once a teacher exists.
5. **Founder email.** `guitaristabhishek07@gmail.com` is a personal Gmail. → Recommend a branded address before mass print (see Open Decisions).
6. **Director’s Circle price.** No public price in the repo. → Shown as “By consultation.”

---

## Deliverable 2 — Conversion Strategy

**Target reader.** The *parent* holds the wallet and the worry; the *student* holds the desire. The handbook must win both — trust for the parent, aspiration for the learner.

**The core message (one line):** *Musicphonetics is not another music class — it’s a complete system for becoming a musician.*

**Parent objections → where the handbook answers them:**

| Objection | Answered on |
|---|---|
| “How do I know there’s real progress?” | p.12 Portal, p.13 Progress you can see |
| “Why more than a private tutor?” | p.4 Ordinary vs a system, p.11 One class / complete ecosystem |
| “Is it safe / trustworthy?” | p.14 Teachers, p.19 Safety, p.20 Payments |
| “My child loses interest.” | p.7 Need not age, p.16 Practice, p.18 Performance |
| “We tried classes before.” | p.1 The problem, p.5 Journey |
| “My child is very young / I’m an adult.” | p.7 We start with the need, not the age |

**Message hierarchy:** Problem → Founder credibility → The system → The difference → The experience &amp; proof → Plans → Trust &amp; safety → Call to action.

**Emotional arc:** *recognition* (“that’s our story”) → *relief* (“there’s a better way”) → *confidence* (“I can see it working”) → *action* (“let’s begin”).

**CTA strategy:** One primary CTA everywhere — **Book a learning consultation** (QR → WhatsApp). One secondary — **Explore Musicphonetics online**. Never more than two.

**Distribution strategy:** full handbook for home visits, the centre, exhibitions, and website/WhatsApp PDF; the 4-page insert for newspapers, societies, churches and school gates; both share one QR so leads are attributable.

---

## Deliverable 3 — Final Table of Contents

| Pg | Headline | Core message | Visual | Screenshot/Photo |
|---|---|---|---|---|
| — | Cover — *Don’t just learn songs. Become a musician.* | Aspiration + credibility | Dark hero, gold, QR | Photo P-01 (opt.) |
| 01 | Most students don’t stop because of talent | The problem is structure | Editorial 2-col + pull quote | — |
| 02 | It began in 2015 with one guitar… | Founder credibility | Ink spread + founder photo | Photo P-02 ✓ embedded |
| 03 | A complete ecosystem | What Musicphonetics is | Ecosystem diagram | — |
| 04 | Ordinary lessons vs a real system | The difference | Comparison table | — |
| 05 | From first enquiry to a real stage | The journey | 12-step timeline | — |
| 06 | Music is more than songs | Complete-musician pillars | 9-pillar grid (forest) | — |
| 07 | We start with the need — not the age | Need-based teaching | 2-col + tailored list | — |
| 08 | What you can learn | Verified instruments &amp; paths | Instrument grid | — |
| 09 | Four ways to learn. One standard. | Modes | 4 mode cards | — |
| 10 | Choose the plan that fits | Plans &amp; pricing | 3 pricing cards | — |
| 11 | One class. A complete ecosystem. | Before/during/after | 3 cards + pull quote | — |
| 12 | Never guess what’s happening | Parent portal | 4 screenshot frames | S-01…S-04 |
| 13 | Real progress, made visible | Progress tracking | Chapter timeline + shot | S-05 |
| 14 | A company relationship | Teacher standard | 7-stage timeline | S-06 (opt.) |
| 15 | The first 90 days | Honest early rhythm | 3 month cards | — |
| 16 | Short, regular, purposeful | Practice that works | 2-col + sample plans | — |
| 17 | Your support changes everything | Parent’s role | Helpful/unhelpful | — |
| 18 | Practice becomes real on a stage | Performance &amp; community | Now/growing split | Photo P-03 (opt.) |
| 19 | Every lesson should feel safe | Safety &amp; trust | 2 cards + forest quote | — |
| 20 | Clear, secure, in the company’s name | Payments | List + card | — |
| 21 | Families who chose structure | Social proof | 2 testimonial frames | Testimonials T-01…02 |
| 22 | The best time to begin well is now | Ethical urgency | Forest split | — |
| 23 | Getting started is simple | Enrolment steps | 7-step timeline | — |
| 24 | Your music journey deserves more | Final CTA | Dark, QR, contacts | — |
| — | Back — *Music education, thoughtfully rebuilt.* | Contact + QR | Dark cover | — |

---

## Deliverable 6 — Screenshot Register

Capture from the **live production site/portals using demo accounts**. Crop to content; remove browser chrome. Target ≥ 2× pixel density for print (≈ 220 dpi at placed size).

| ID | Title | Source page | Used on | Account | Privacy treatment | Print res | Replace when |
|---|---|---|---|---|---|---|---|
| S-01 | Parent dashboard | Parent portal home | p.12 | Demo parent | Remove name, phone, student ID | 1600×1000 | Portal UI change |
| S-02 | Homework | Parent → homework | p.12 | Demo parent | None needed (demo text) | 1600×1000 | UI change |
| S-03 | Monthly report | Parent → reports | p.12 | Demo parent | Remove student name | 1600×1000 | Report layout change |
| S-04 | Invoices &amp; receipts | Parent → payments | p.12 | Demo parent | **Remove all amounts if real**, txn refs, invoice no. | 1600×1000 | Billing UI change |
| S-05 | Curriculum progress | Parent → progress | p.13 | Demo (Foundation) | Remove student name | 1600×1000 | Foundation UI change |
| S-06 | Teacher profile (verified) | Owner → teachers, or public faculty | p.14 | Demo/approved teacher | Remove bank/PAN, address, personal phone | 1600×1000 | Onboarding UI change |

**Screenshot rules (from brief, retained):** exact live UI; demo accounts; never expose real personal data; blur/replace names, phones, emails, addresses, student IDs, bank/PAN, invoices, payment refs, internal URLs, uploaded docs; readable text; captions on every shot; callouts only where useful; no browser tabs/devtools/code; verify each shot against its written claim; record capture date; flag for replacement on UI change.

---

## Deliverable 7 — Print-Production Specification

| Spec | Handbook | Newspaper insert |
|---|---|---|
| Trim size | A4 portrait (210 × 297 mm) | A4 portrait (folds to A5) |
| Pages | 26 (self-cover) or 24pp text + 4pp cover | 4pp |
| Bleed | 3 mm all edges (extend dark spreads to bleed) | 3 mm |
| Safety margin | 15–19 mm (already built into `--pad`) | 12–15 mm |
| Cover stock | 250–300 gsm silk, matt lamination (soft-touch ideal) | n/a |
| Inner stock | 130–170 gsm silk art | 45–52 gsm newsprint (insert) / 100 gsm for standalone |
| Binding | Saddle-stitch (pages must be a multiple of 4 — 24pp works) | Single fold |
| Colour | CMYK; convert gold to a rich CMYK build (≈ C10 M25 Y80 K10) or spec **Pantone 872/873 metallic** for a premium run | CMYK only |
| Resolution | Images ≥ 300 dpi at placed size; QR ≥ 20 mm and ≥ 600 dpi | QR ≥ 22 mm |
| Min font | Body 9.5 pt; captions/tiny 7.5 pt floor | 8 pt floor on newsprint |
| Economy option | Grayscale-safe: layout still reads without colour (contrast carries it); drop metallic gold to K-tint | Mono newsprint fine |

**Newspaper recommendation.** Use the **4-page A4 insert** (folds to A5) on newsprint, *not* a shrunk handbook. It carries only the seven essentials — front hook, the difference, plans/price, journey, portal proof, credibility, QR CTA — at readable sizes. An 8-page mini-magazine is worth it only for a premium society/church drop; for mass newspaper distribution, 4pp keeps cost and legibility right.

---

## Deliverable 8 — Teacher Sales-Use Guide (home visit)

**Before you go:** carry a clean copy; open your own portal to a demo student; silence your phone.

**The conversation (don’t pitch — diagnose):**
1. Ask what the student loves — a song, an artist, an instrument.
2. Ask about any previous learning and what went wrong.
3. Name the family’s real concern (progress? cost? safety? attention?).
4. Open the handbook to the *one* page that answers it (see map).
5. Explain the **system**, not the school — structure, tracking, accountability.
6. Show the **portal** (p.12–13) — this is what closes; let them see visibility.
7. Recommend the fitting plan (p.10). Don’t upsell; fit it to the need.
8. Never pressure. Invite the next step.
9. Do the enrolment through the **official process** (QR → WhatsApp → activation). Never take cash.

**Page map for common lines:**

| They say… | Turn to |
|---|---|
| “My child loses interest.” | p.7 (need, not age), p.18 (performance) |
| “We tried classes before.” | p.1 (the problem), p.5 (the journey) |
| “How will I know there’s progress?” | p.12–13 (portal + progress) |
| “Why costlier than a private tutor?” | p.4 (system), p.11 (ecosystem), p.20 (payments) |
| “Can the teacher come home?” | p.9 (modes) |
| “What if a class is missed?” | p.4 &amp; p.12 (attendance documented) |
| “My child is very young.” | p.7 (we teach any age to its need) |
| “My child only wants songs.” | p.6 (complete musician), p.7 |
| “We want exam preparation.” | p.8 (Trinity), p.5 |
| “I’m an adult beginner.” | p.7 (need-based), p.15 (first 90 days) |

---

## Deliverable 9 — Newspaper Edition

Delivered: `newspaper-insert.html` (4pp A4, folds to A5). Same brand system, condensed copy, one shared QR. Print on newsprint 45–52 gsm; mono-safe.

---

## Deliverable 10 — Digital Edition

- **Master:** open `enrollment-handbook.html` in Chrome → Save as PDF (A4). Embedded fonts render as Fraunces/Hanken with network, Georgia offline — both look clean.
- **WhatsApp / mobile:** the HTML is already responsive (single-column under 800 px) so the file itself previews well on a phone; for the PDF, export a **web-optimised** version and keep it **under ~8 MB** (downsample placed images to 150–200 dpi) so it sends on WhatsApp without the “document too large” friction.
- **Website download:** host the full-res PDF behind the “Download brochure” CTA; host the insert PDF separately.
- **Lead follow-up:** attach the insert PDF (small) in first reply; send the full handbook PDF after the consultation is booked.

---

## Deliverable 11 — Open Decisions Register

| # | Decision | Current info | Recommendation | Why it matters | Founder sign-off |
|---|---|---|---|---|---|
| 1 | Middle plan name | System says “Main Pathway”; brief said “Transformation” | Keep **Main Pathway** (matches portal) OR rename system-wide | Name must match what parents see in the portal &amp; invoices | ☐ |
| 2 | Director’s Circle price | Not public | Keep “By consultation,” set an internal floor | Avoids a printed price you can’t honour | ☐ |
| 3 | Instrument list | 7 verified | Add sax/flute/tabla/etc. **only** when a teacher exists | Brief forbids advertising unstaffed instruments | ☐ |
| 4 | Instagram handle | Two exist in code | Confirm the live one; align both | One wrong handle on 10,000 inserts is costly | ☐ |
| 5 | Public email | Personal Gmail | Use a branded `hello@` / `admin@musicphonetics…` | Credibility on a premium asset | ☐ |
| 6 | Metallic gold | CMYK build supplied | Approve Pantone 872 for the premium run | Cost vs. shelf-appeal | ☐ |
| 7 | Founder cover photo | Founder photo embedded on p.2 | Decide if a student-focused cover photo (P-01) is added | Cover currently type-led (clean); a photo adds warmth | ☐ |
| 8 | Testimonials | None printed | Supply 2–3 approved quotes (initials, no photos w/o consent) | Social proof must be real | ☐ |
| 9 | Legal name | “Registered sole proprietorship” | Add exact registered name + GST/Udyam line on back cover if required | Compliance on print | ☐ |

---

## Deliverable 12 — Final Quality Audit

| Check | Status |
|---|---|
| Correct Musicphonetics logo (real asset, not redrawn) | ✅ embedded `logo-wordmark-light/dark.webp` |
| Correct colours &amp; identity (ink/gold/paper/forest; gold-on-light = `#7A5E0F`) | ✅ from `tailwind.config.ts` |
| Correct plan names &amp; prices | ✅ Foundation ₹8,000 / Main Pathway ₹12,000 / Director’s Circle bespoke |
| Correct contact details | ✅ +91 87961 99188, @abhisheksessions |
| Correct portal workflows described | ✅ attendance/homework/goals/reports/invoices |
| No invented claims | ✅ roadmap items labelled; no “#1 in India,” no fake awards/numbers |
| No private information | ✅ screenshots are labelled frames, not real captures |
| Readable text / no distortion / logo untouched | ✅ verified via render |
| Strong single CTA + clear enrolment path | ✅ QR → WhatsApp on cover, p.24, back, insert |
| Ethical sales language | ✅ no scarcity, no fear, honest expectations |
| Mobile PDF readability | ✅ responsive; single-column under 800 px |
| Print readiness (bleed/margins/CMYK/min font) | ✅ spec provided; ⚠ set 3 mm bleed at export |
| Screenshots &amp; testimonials inserted | ⏳ pending capture/approval (registers provided) |

---

## My input — recommendations beyond the brief

1. **Lead with a type-led cover, add a photo only if it’s genuinely great.** A weak stock photo would cheapen it; the current cover is confident on its own. (Open Decision 7.)
2. **Drop rigid age brackets — done.** Per your steer, p.7 reframes the whole thing as *“we start with the need, not the age.”* It’s more honest and more flattering to adult learners, and it removes a place where a parent could feel their child was “put in a box.”
3. **Make the portal the closer.** In a market full of tutors, *visibility* is your unfair advantage. I gave it a full spread (p.12) framed entirely around the parent’s real questions. Get those 4–5 screenshots captured first — they matter more than any adjective.
4. **Two testimonials, not twenty.** A wall of star cards reads as insecure. Two credible, approved stories read as confident.
5. **Consider a metallic gold run for the cover only** — biggest premium signal per rupee. Inner pages stay CMYK.
6. **Version everything.** “Edition 2026 · v1.0” is printed so you can retire old stock when prices or UI change. Re-shoot screenshots whenever the portal UI changes (flagged in the register).

---

## Implementation Report

- **Pages created:** Handbook 26 (cover + 24 spreads + back). Insert 4.
- **Files created:**
  - `docs/handbook/enrollment-handbook.html` (~1.3 MB, self-contained)
  - `docs/handbook/newspaper-insert.html` (~0.19 MB, self-contained)
  - `docs/handbook/production-dossier.md` (this file)
- **Assets used (real, from repo):** `logo-wordmark-light.webp`, `logo-wordmark-dark.webp`, `founder.webp`, plus a generated **live WhatsApp QR** (→ wa.me/918796199188 with a “book a learning consultation” prefill). Fonts: Fraunces + Hanken Grotesk (with Georgia/system fallback).
- **Missing photographs (to supply):** P-01 cover (optional), P-03 performance (optional). Founder P-02 is embedded.
- **Screenshots (to capture):** S-01…S-06 per register — from demo accounts, privacy-scrubbed.
- **Confirmed claims:** plans/prices, instruments (7 verified), contact, 10+ yrs / 1,100+ students, portal features, 7-stage teacher standard, company payments.
- **Claims removed/softened:** unstaffed instruments removed; police/background-check claim avoided; “Transformation” → “Main Pathway”; fixed-timeline outcome promises replaced with cautious language; roadmap items (group/academy, annual concerts, recordings) labelled as growing.
- **Founder decisions required:** 9 items (register above).
- **Print recommendation:** Handbook — A4 saddle-stitch, 300 gsm soft-touch cover + 150 gsm silk inner, CMYK with optional Pantone 872 gold. Insert — 4pp A4 newsprint.
- **Estimated print cost tiers:** *No live quotation available* — obtain 3 Delhi press quotes for (a) 500, (b) 2,000, (c) 5,000 handbook copies and (d) 20,000 inserts. Flagged as an Open Decision; do not print a cost you can’t verify.
- **Digital PDF size target:** ≤ 8 MB (WhatsApp-safe) via 150–200 dpi image downsample; full-res for web/print.
- **Repository location:** `docs/handbook/` on branch `claude/musicphonetics-platform-tsjtk7`.
- **Final commit hash:** *(recorded in the chat reply after commit &amp; push)*
