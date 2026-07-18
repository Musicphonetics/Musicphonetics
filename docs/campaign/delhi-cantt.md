# Musicphonetics — Delhi Cantt Launch Campaign

Landing page + lead capture + poster assets for the Delhi Cantt–exclusive Main Pathway launch benefit.

## Ready-to-paste WhatsApp group message

> 🎶 *Musicphonetics — exclusive for Delhi Cantt families*
>
> Give your child’s (or your own) musical journey the *right beginning* — structured lessons with carefully matched teachers, homework, attendance tracking and regular parent updates.
>
> 🎁 *Delhi Cantt launch benefit*
> Main Pathway — ~₹12,000~ → *₹10,000/month* (save ₹2,000)
> 8 structured classes every month.
>
> Guitar • Piano • Vocals • Drums • Violin • More
> 🏠 Home · 💻 Online · 🎹 South Delhi centre
>
> 👉 Claim in under a minute: https://musicphonetics.com/delhi-cantt?utm_source=whatsapp&utm_medium=society_group&utm_campaign=delhi_cantt_launch&utm_content=poster
>
> _For new learners residing in Delhi Cantt. Subject to teacher availability & mode confirmation._

*(Paste the portrait poster image above the text for the strongest hook.)*

---

## Delivery report

1. **Route created:** `/delhi-cantt` (static; focused charcoal shell, no site nav — mirrors `/start`).
2. **Files created:**
   - `app/delhi-cantt/page.tsx`, `app/delhi-cantt/layout.tsx` (route + WhatsApp/OG metadata)
   - `components/campaign/DelhiCanttLanding.tsx` (hero + polished 3-step form + success)
   - `lib/delhi-cantt.ts` (single source of truth for the offer)
   - `functions/api/delhi-cantt-lead.js` (Cloudflare Function: server-side validation + lead delivery)
   - `supabase/campaign_leads.sql` (optional lead table)
   - `public/campaign/delhi-cantt-poster-1080x1350.png`, `…-1080x1080.png`, `…-og-1200x630.png`
   - `public/og-delhi-cantt.png` (WhatsApp/OG preview)
   - `docs/campaign/delhi-cantt.md` (this file)
   - **Modified:** none of the existing pages — no unrelated changes.
3. **How offer eligibility is controlled:** `DELHI_CANTT.active` (and optional `expiresOn`) in `lib/delhi-cantt.ts`. Set `active: false` → the landing page hides the form and shows a graceful “closed” state. One file, one flag. The Function also carries `OFFER.active` as a server backstop.
4. **How the discount is validated:** entirely **server-side** in `functions/api/delhi-cantt-lead.js`. The browser never sends prices; the Function stamps the authoritative `regular_price 12000 / offer_price 10000 / discount 2000 / offer_code DELHICANTT2000 / campaign / source` on every lead. It also normalises + validates the Indian mobile (`^[6-9]\d{9}$`), requires learner name + area, honours a honeypot, and rate-limits per IP.
5. **How leads are stored:** the existing **Web3Forms lead channel** (same inbox as `/start`) — a richly-labelled email with learner, age, instrument, mode, area, enquirer, WhatsApp (+ click-to-call & click-to-WhatsApp links), offer, code, source, campaign, UTM, status “New”, and next-step guidance. If `campaign_leads` + `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` exist, it is **also** best-effort stored in the DB (no duplicate system; email is the guaranteed path).
6. **Where the owner sees campaign leads:** the Musicphonetics lead inbox today (every field + WhatsApp/call links, subject prefixed `🎖️ Delhi Cantt Lead …`). If you run `supabase/campaign_leads.sql` and set the env keys, leads also land in the `campaign_leads` table (owner-readable via RLS) — ready for a future owner-portal list view with the statuses New → Contacted → Consultation booked → Trial booked → Enrolled → Not proceeding.
7. **Poster files generated:** portrait, square, OG (below).
8. **Poster dimensions & paths:**
   - `public/campaign/delhi-cantt-poster-1080x1350.png` — 1080×1350 (WhatsApp status / Instagram portrait)
   - `public/campaign/delhi-cantt-poster-1080x1080.png` — 1080×1080 (Instagram square)
   - `public/campaign/delhi-cantt-og-1200x630.png` — 1200×630 (link preview) → also copied to `public/og-delhi-cantt.png`
9. **Final campaign URL:** `https://musicphonetics.com/delhi-cantt`
10. **Recommended UTM share URL:** `https://musicphonetics.com/delhi-cantt?utm_source=whatsapp&utm_medium=society_group&utm_campaign=delhi_cantt_launch&utm_content=poster`
11. **Environment variables (all optional):** `WEB3FORMS_ACCESS_KEY` (falls back to the existing public key), `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (only to also store in `campaign_leads`; service key stays server-side in the Function — never in client code).
12. **Manual steps remaining:**
    - Deploy (Cloudflare Pages picks up the new route + Function automatically).
    - *(Optional)* run `supabase/campaign_leads.sql` and set the Supabase env keys to enable DB storage.
    - Confirm the offer terms wording: this presents **₹10,000/month as the launch fee** (per the written brief). If it should instead be **first month only**, tell me and I’ll flip the copy — it’s centralised in `lib/delhi-cantt.ts`.
    - Paste the WhatsApp message + portrait poster into the Delhi Cantt groups.
13. **Build/lint/mobile tests:** `tsc --noEmit` clean · `next build` static export succeeds (`/delhi-cantt` emitted) · rendered + visually checked on a 390 px mobile viewport (hero, multi-step form) and all three posters at exact pixel sizes.

## Honesty notes
- No false scarcity, no countdown, no “No. 1”, no guaranteed results.
- Success screen explicitly says the **seat is confirmed only after teacher availability is verified**.
- Poster is type-led (matches your reference) with the real wordmark — no copyrighted internet images and no identifiable child’s face used for a paid ad. To add a photo later, drop a warm, consented learner image behind the poster and I’ll wire it in as a replaceable layer.
