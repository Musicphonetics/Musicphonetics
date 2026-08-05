// Branded email HTML for the teacher onboarding funnel: Offer letter (with an
// Accept button) and the Joining agreement (with portal login details).
// Underscore-prefixed → importable, never routed. Kept as the single source for
// these emails so send-offer.js and approve-teacher.js stay consistent.

export const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export const JOINING_CLAUSES = [
  ["Nature of engagement", "You are engaged as an independent teaching partner, not an employee, and are solely responsible for your own conduct, acts and omissions."],
  ["Term & review", "The engagement begins on signing and continues until ended under the Termination clause. The first 60 days are a review period."],
  ["Duties & standard", "Teach professionally and punctually to the Musicphonetics standard, update the portal after every class, keep accurate progress notes, and report any concern immediately."],
  ["Fees & revenue share", "All fees are collected only through the official Musicphonetics payment interface. From each fee, ~3% is deducted as the interface/gateway charge; from the net, your share is 70% and Musicphonetics retains 30%. Never collect fees directly from a student or parent."],
  ["Verification (good faith, not a guarantee)", "You warrant that all information, identity and bank details you gave are true. Musicphonetics verifies teachers in good faith; this is not a guarantee of anyone's conduct, and you alone are responsible for your actions."],
  ["Liability & indemnity", "You are solely responsible for your own acts. Musicphonetics is not liable for any theft, damage, injury, harassment, unauthorised recording or misconduct committed by you, and you indemnify Musicphonetics against any loss or claim arising from your breach, negligence or unlawful act."],
  ["Confidentiality", "Keep all student, parent, payment and internal information strictly confidential, during and after the engagement."],
  ["Intellectual property & recordings", "Musicphonetics materials remain its property and are used only for Musicphonetics classes. Do not photograph or record any student or class without prior written consent from Musicphonetics and the parent."],
  ["Safeguarding", "Maintain the highest child-safety standards: no inappropriate contact, no private late-night messaging with minors, guardian awareness at all times, and immediate reporting of any concern."],
  ["Non-solicitation", "During the engagement and for 6 months after, do not privately teach, solicit or accept payment from any student, parent, teacher or staff introduced through Musicphonetics."],
  ["Conduct & anti-fraud", "No misrepresentation, unauthorised commitments, side deals, or dishonest or unlawful activity."],
  ["Termination", "Either party may end the engagement with 15 days' notice. Musicphonetics may terminate immediately for cause - including theft, fraud, a safeguarding breach, unauthorised recording, direct fee collection or serious misconduct."],
  ["Governing law", "This engagement is governed by the laws of India; the courts at Delhi NCR have jurisdiction. Confidentiality and non-solicitation survive termination."],
];

export const DECLARATIONS = [
  "All information, qualifications, identity and bank details I provided are true and current.",
  "I am an independent teaching partner, solely responsible for my own conduct and acts.",
  "I understand verification is done in good faith but is not a guarantee of anyone's conduct.",
  "I will collect no fees directly and will use only the official payment interface.",
  "I agree to the confidentiality, safeguarding, IP and non-solicitation terms.",
  "I will indemnify Musicphonetics against loss from my breach, negligence, misconduct or unlawful act.",
];

const shell = (title, inner) => `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#161b26">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#161b26;border-radius:16px 16px 0 0;padding:22px 24px">
      <p style="margin:0;font-size:20px;font-weight:800;letter-spacing:.5px;color:#fff">MUSICPHONETICS</p>
      <p style="margin:6px 0 0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#c9a227">${esc(title)}</p>
    </div>
    <div style="background:#fff;border:1px solid #e7e2d6;border-top:0;border-radius:0 0 16px 16px;padding:24px">
      ${inner}
      <p style="margin:18px 0 0;font-size:12px;color:#9aa">Questions? WhatsApp us at +91 87961 99188.</p>
      <p style="margin:14px 0 0;font-size:13px;color:#3a3f4a">Warm regards,<br><b>Abhishek Kumar</b><br>Founder &amp; Director, Musicphonetics</p>
    </div>
  </div></body></html>`;

const incomeBlock = `
  <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7a5e0f">How your income works</p>
  <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3a3f4a">
    All fees are collected only through the official Musicphonetics payment account. From each fee, the
    payment interface deducts its processing charge of <b>approximately 3%</b>. From the net settled amount
    that remains, your share is <b>70%</b> and Musicphonetics retains <b>30%</b>. Payouts are made to your
    registered bank/UPI account after each payment is received and verified.
  </p>`;

// STEP 1 — Offer letter with an Accept button (no login yet).
export function offerEmailHtml({ name, acceptUrl }) {
  const first = esc((name || "there").split(" ")[0]);
  return shell("Teacher Offer Letter", `
    <p style="margin:0 0 12px;font-size:15px">Dear ${first},</p>
    <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3a3f4a">
      Congratulations — following your application to teach with <b>Musicphonetics</b>, we are delighted to offer
      you a place in our teaching network. This letter sets out the essentials of your engagement. To move ahead,
      please review and <b>accept your offer</b> below; we will then send you the full Joining Agreement to sign.
    </p>
    <div style="border:1px solid #e7e2d6;border-radius:12px;padding:16px;margin:16px 0;background:#faf8f3">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7a5e0f">Your engagement</p>
      <ul style="margin:6px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#3a3f4a">
        <li>Independent teaching partner (not an employee), teaching to the Musicphonetics standard.</li>
        <li>Fees collected only through the official interface; your share is <b>70%</b> after the ~3% gateway charge.</li>
        <li>A 60-day review period from the date you begin.</li>
      </ul>
    </div>
    ${incomeBlock}
    <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3a3f4a">
      When you are ready, click below to accept and agree to the terms. <b>As soon as you accept, we'll email you the
      full Joining Agreement and your portal login with a temporary password</b> — so you can sign in right away.
    </p>
    <a href="${esc(acceptUrl)}" style="display:inline-block;background:#161b26;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px">✓ I accept &amp; agree to the terms</a>
    <p style="margin:14px 0 0;font-size:12px;color:#9aa">If the button doesn't work, open this link: <br>${esc(acceptUrl)}</p>`);
}

// STEP 3 — Joining agreement (full clauses) + portal login details.
export function joiningEmailHtml({ name, email, password, portal }) {
  const first = esc((name || "there").split(" ")[0]);
  const login = password
    ? `<div style="border:1px solid #e7e2d6;border-radius:12px;padding:16px;margin:16px 0;background:#faf8f3">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7a5e0f">Your portal login</p>
        <p style="margin:4px 0;font-size:14px"><span style="color:#6b6f78">Portal:</span> <a href="${esc(portal)}" style="color:#161b26;font-weight:700;text-decoration:none">${esc(portal)}</a></p>
        <p style="margin:4px 0;font-size:14px"><span style="color:#6b6f78">Login email:</span> <b>${esc(email)}</b></p>
        <p style="margin:4px 0;font-size:14px"><span style="color:#6b6f78">Temporary password:</span> <b style="font-family:monospace">${esc(password)}</b></p>
        <p style="margin:10px 0 0;font-size:12px;color:#6b6f78">Please change your password after your first sign-in.</p>
      </div>`
    : "";
  return shell("Joining Agreement", `
    <p style="margin:0 0 12px;font-size:15px">Dear ${first},</p>
    <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3a3f4a">
      Thank you for accepting your offer. Below is your full <b>Joining Agreement</b>${password ? " together with your portal login details" : ""}.
      Please read every clause carefully.
    </p>
    ${login}
    <p style="margin:0 0 4px;font-size:15px;font-weight:800;color:#161b26">Your Joining Agreement — full terms</p>
    <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#3a3f4a">By signing in and continuing, and by returning the signed agreement, you accept these terms.</p>
    <ol style="margin:0 0 8px;padding-left:18px;font-size:13px;line-height:1.6;color:#3a3f4a">
      ${JOINING_CLAUSES.map(([h, t]) => `<li style="margin:0 0 8px"><b style="color:#161b26">${esc(h)}.</b> ${esc(t)}</li>`).join("")}
    </ol>
    <p style="margin:16px 0 6px;font-size:13px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#7a5e0f">Your declaration</p>
    <ul style="margin:0 0 8px;padding-left:18px;font-size:13px;line-height:1.6;color:#3a3f4a">
      ${DECLARATIONS.map((t) => `<li style="margin:0 0 6px">${esc(t)}</li>`).join("")}
    </ul>
    <p style="margin:16px 0 6px;font-size:14px;line-height:1.6;color:#3a3f4a">Please <b>reply to this email to confirm you accept the terms</b>${password ? ", then sign in to your portal" : ""}.</p>
    ${password ? `<a href="${esc(portal)}" style="display:inline-block;margin-top:8px;background:#161b26;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px">Sign in to your portal →</a>` : ""}`);
}

// A tiny standalone HTML page shown to the teacher after they click "Accept".
export function acceptConfirmPage({ name, alreadyAccepted }) {
  const first = esc((name || "there").split(" ")[0]);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offer accepted · Musicphonetics</title></head>
  <body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#161b26">
    <div style="max-width:520px;margin:0 auto;padding:48px 20px;text-align:center">
      <div style="background:#161b26;border-radius:16px;padding:28px 24px;color:#fff">
        <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:.5px">MUSICPHONETICS</p>
        <div style="margin:22px auto 0;width:56px;height:56px;border-radius:50%;background:#1f7a4d;line-height:56px;font-size:30px;color:#fff">✓</div>
        <h1 style="margin:18px 0 6px;font-size:22px">${alreadyAccepted ? "Already accepted" : "Offer accepted"}</h1>
        <p style="margin:0;font-size:15px;color:#d8d4c8;line-height:1.6">
          Thank you, ${first}. ${alreadyAccepted
            ? "Your acceptance is already on record, and your login details were emailed to you."
            : "We've recorded your acceptance. Your Joining Agreement and portal login — with a temporary password — are on their way to your inbox right now. Please check your email (including Promotions/Spam)."}
          Welcome aboard!
        </p>
      </div>
      <p style="margin:18px 0 0;font-size:12px;color:#9aa">You can close this window. Questions? WhatsApp +91 87961 99188.</p>
    </div>
  </body></html>`;
}
