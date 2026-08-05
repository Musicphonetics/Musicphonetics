// GET /api/calendar?token=<calendar_token>   (PUBLIC — the token is the secret)
// Returns a private iCalendar (.ics) feed the user subscribes to in Apple/Google
// Calendar. It auto-refreshes on their phone, so any class or event added in the
// portal shows up automatically. Read-only.
//
//   • teacher token → that teacher's classes + events
//   • owner  token → every teacher's classes + events (labelled with the teacher)
//
// Times are emitted as floating local time (IST for all users), which every
// calendar app renders in the device's local zone.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

const admin = (env) => ({ apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" });

const ics = (body, status = 200) => new Response(body, {
  status,
  headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "no-cache, max-age=0", "content-disposition": "inline; filename=musicphonetics.ics" },
});

// iCal text escaping + local datetime formatting.
const esc = (v) => String(v ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const dt = (date, time) => `${String(date).replace(/-/g, "")}T${String(time || "00:00:00").replace(/:/g, "").padEnd(6, "0")}`;
const addMin = (time, mins) => {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  const t = ((h * 60 + m + mins) % 1440 + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}:00`;
};
const isoDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

// Fold long lines to 75 octets per RFC 5545 (calendars are strict-ish).
function fold(line) {
  if (line.length <= 74) return line;
  let out = line.slice(0, 74), rest = line.slice(74);
  while (rest.length > 73) { out += "\r\n " + rest.slice(0, 73); rest = rest.slice(73); }
  return out + "\r\n " + rest;
}

function vevent({ uid, date, start, end, summary, location, description, cancelled }) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}@musicphonetics`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dt(date, start)}`,
    `DTEND:${dt(date, end || addMin(start, 60))}`,
    `SUMMARY:${esc(summary)}`,
    location ? `LOCATION:${esc(location)}` : "",
    description ? `DESCRIPTION:${esc(description)}` : "",
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
  ].filter(Boolean);
  return lines.map(fold).join("\r\n");
}

export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return ics("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Musicphonetics//Portal//EN\r\nEND:VCALENDAR");
  }

  // Resolve the token → profile.
  const pRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?calendar_token=eq.${encodeURIComponent(token)}&select=id,role,full_name&limit=1`, { headers: admin(env) });
  const profs = pRes.ok ? await pRes.json() : [];
  const me = profs[0];
  if (!me) return ics("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Musicphonetics//Portal//EN\r\nEND:VCALENDAR");

  const isOwner = me.role === "owner";
  const from = isoDays(-90), to = isoDays(180);
  const scope = isOwner ? "" : `&teacher_id=eq.${me.id}`;

  const [scRes, evRes, stRes, tpRes] = await Promise.all([
    fetch(`${env.SUPABASE_URL}/rest/v1/scheduled_classes?scheduled_date=gte.${from}&scheduled_date=lte.${to}${scope}&select=*&order=scheduled_date`, { headers: admin(env) }),
    fetch(`${env.SUPABASE_URL}/rest/v1/calendar_events?event_date=gte.${from}&event_date=lte.${to}${scope}&select=*&order=event_date`, { headers: admin(env) }),
    fetch(`${env.SUPABASE_URL}/rest/v1/students?select=id,name`, { headers: admin(env) }),
    isOwner ? fetch(`${env.SUPABASE_URL}/rest/v1/profiles?role=eq.teacher&select=id,full_name`, { headers: admin(env) }) : Promise.resolve(null),
  ]);
  const classes = scRes.ok ? await scRes.json() : [];
  const events = evRes.ok ? await evRes.json() : [];
  const students = stRes.ok ? await stRes.json() : [];
  const teachers = tpRes && tpRes.ok ? await tpRes.json() : [];
  const sName = Object.fromEntries(students.map((s) => [s.id, s.name]));
  const tName = Object.fromEntries(teachers.map((t) => [t.id, t.full_name || "Teacher"]));

  const parts = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Musicphonetics//Portal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    fold(`X-WR-CALNAME:Musicphonetics${isOwner ? "" : " · " + esc(me.full_name || "Classes")}`),
    "X-WR-TIMEZONE:Asia/Kolkata",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const c of classes) {
    const who = sName[c.student_id] || "Student";
    const tag = isOwner ? ` (${tName[c.teacher_id] || "Teacher"})` : "";
    const cancelled = String(c.status || "").startsWith("cancelled");
    parts.push(vevent({
      uid: `class-${c.id}`, date: c.scheduled_date, start: c.start_time, end: c.end_time,
      summary: `Class — ${who}${tag}`,
      location: c.location || (c.mode ? c.mode : ""),
      description: [c.mode ? `Mode: ${c.mode}` : "", c.notes || "", c.status ? `Status: ${c.status}` : ""].filter(Boolean).join(" · "),
      cancelled,
    }));
  }
  for (const e of events) {
    const tag = isOwner ? ` (${tName[e.teacher_id] || "Teacher"})` : "";
    parts.push(vevent({
      uid: `event-${e.id}`, date: e.event_date, start: e.start_time || "09:00:00", end: e.end_time,
      summary: `${e.title}${tag}`, location: e.location || "", description: e.notes || "",
    }));
  }

  parts.push("END:VCALENDAR");
  return ics(parts.join("\r\n"));
}
