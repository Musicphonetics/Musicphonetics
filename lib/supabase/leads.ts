// Lead data layer — server-side pagination + filters, built for 1,000+ leads.
// Never SELECT * the whole table; the list pulls only the columns it shows and
// pages with .range(). Writes go through the SECURITY DEFINER RPCs (assign,
// update, convert) so RLS + activity logging + notifications stay authoritative.
import { getSupabase } from "./client";

export const LEAD_STATUSES = [
  "new", "unassigned", "assigned", "contacted", "follow_up", "trial_booked",
  "trial_completed", "interested", "payment_pending", "converted", "not_interested", "lost", "duplicate",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "New", unassigned: "Unassigned", assigned: "Assigned", contacted: "Contacted",
  follow_up: "Follow-up", trial_booked: "Trial booked", trial_completed: "Trial done",
  interested: "Interested", payment_pending: "Payment pending", converted: "Converted",
  not_interested: "Not interested", lost: "Lost", duplicate: "Duplicate",
};

// Tone for status chips.
export const LEAD_STATUS_TONE: Record<string, string> = {
  new: "bg-gold/15 text-[#7A5E0F]", unassigned: "bg-ink/10 text-ink/70", assigned: "bg-forest/12 text-forest",
  contacted: "bg-forest/12 text-forest", follow_up: "bg-gold/15 text-[#7A5E0F]", trial_booked: "bg-forest/12 text-forest",
  trial_completed: "bg-forest/12 text-forest", interested: "bg-gold/15 text-[#7A5E0F]", payment_pending: "bg-gold/20 text-[#7A5E0F]",
  converted: "bg-feature-green/15 text-feature-green", not_interested: "bg-red-500/10 text-red-600",
  lost: "bg-red-500/10 text-red-600", duplicate: "bg-ink/10 text-ink/55",
};

export interface LeadListRow {
  id: string; lead_code: string;
  student_name: string | null; parent_name: string | null;
  phone: string | null; email: string | null;
  instrument_interest: string | null; preferred_area: string | null;
  source: string | null; campaign: string | null;
  status: string; assigned_teacher_id: string | null;
  created_at: string; last_activity_at: string | null; next_follow_up_at: string | null; enquiry_count: number;
}

const LIST_COLS =
  "id,lead_code,student_name,parent_name,phone,email,instrument_interest,preferred_area,source,campaign,status,assigned_teacher_id,created_at,last_activity_at,next_follow_up_at,enquiry_count";

export interface LeadFilters {
  page: number; pageSize: number;
  status?: string;               // '' | 'all' | a status
  assigned?: string;             // '' | 'all' | 'unassigned' | teacherId
  source?: string;               // '' | 'all' | a source
  followUpDue?: boolean;
  search?: string;
}

// Strip characters that would break PostgREST's or() filter grammar.
const safe = (s: string) => s.replace(/[,()*%]/g, " ").trim();

export async function loadLeads(f: LeadFilters): Promise<{ rows: LeadListRow[]; total: number; error: string | null }> {
  const sb = getSupabase();
  let q = sb.from("leads").select(LIST_COLS, { count: "exact" });

  if (f.status && f.status !== "all") q = q.eq("status", f.status);
  if (f.assigned === "unassigned") q = q.is("assigned_teacher_id", null);
  else if (f.assigned && f.assigned !== "all") q = q.eq("assigned_teacher_id", f.assigned);
  if (f.source && f.source !== "all") q = q.eq("source", f.source);
  if (f.followUpDue) q = q.not("next_follow_up_at", "is", null).lte("next_follow_up_at", new Date().toISOString());
  if (f.search && f.search.trim()) {
    const s = safe(f.search);
    if (s) q = q.or(`lead_code.ilike.%${s}%,student_name.ilike.%${s}%,parent_name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,preferred_area.ilike.%${s}%,instrument_interest.ilike.%${s}%`);
  }

  const from = f.page * f.pageSize;
  q = q.order("created_at", { ascending: false }).range(from, from + f.pageSize - 1);

  const { data, error, count } = await q;
  return { rows: (data as LeadListRow[]) ?? [], total: count ?? 0, error: error ? error.message : null };
}

export interface LeadDetail extends LeadListRow {
  alternate_phone: string | null; student_age: string | null; preferred_mode: string | null;
  city: string | null; preferred_days: string | null; preferred_time: string | null;
  experience_level: string | null; learning_goal: string | null; message: string | null;
  preferred_program: string | null; coupon_code: string | null; priority: string;
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null;
  landing_page: string | null; referrer: string | null;
  assigned_sales_user_id: string | null; first_contacted_at: string | null; last_contacted_at: string | null;
  converted_at: string | null; lost_at: string | null; lost_reason: string | null;
  internal_notes: string | null; converted_student_id: string | null;
}
export interface LeadActivity { id: string; event_type: string; actor_id: string | null; actor_role: string | null; metadata: Record<string, unknown> | null; created_at: string }

export async function loadLeadDetail(id: string): Promise<{ lead: LeadDetail | null; activity: LeadActivity[]; error: string | null }> {
  const sb = getSupabase();
  const [l, a] = await Promise.all([
    sb.from("leads").select("*").eq("id", id).single(),
    sb.from("lead_activity").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
  ]);
  return {
    lead: (l.data as LeadDetail | null) ?? null,
    activity: (a.data as LeadActivity[]) ?? [],
    error: l.error ? l.error.message : null,
  };
}

// Teacher's own assigned leads (RLS scopes to assigned_teacher_id = auth.uid()).
export interface TeacherLead {
  id: string; lead_code: string; student_name: string | null; parent_name: string | null;
  phone: string | null; email: string | null; instrument_interest: string | null;
  preferred_mode: string | null; preferred_area: string | null; learning_goal: string | null;
  status: string; created_at: string; first_contacted_at: string | null;
  next_follow_up_at: string | null; converted_student_id: string | null;
}
export async function loadTeacherLeads(): Promise<{ rows: TeacherLead[]; error: string | null }> {
  const { data, error } = await getSupabase()
    .from("leads")
    .select("id,lead_code,student_name,parent_name,phone,email,instrument_interest,preferred_mode,preferred_area,learning_goal,status,created_at,first_contacted_at,next_follow_up_at,converted_student_id")
    .order("created_at", { ascending: false }).limit(500);
  return { rows: (data as TeacherLead[]) ?? [], error: error ? error.message : null };
}
/** New = assigned but not yet contacted and still open. Drives the badge. */
export const isNewLead = (l: { first_contacted_at: string | null; converted_student_id: string | null; status: string }) =>
  !l.first_contacted_at && !l.converted_student_id && !["lost", "not_interested", "duplicate", "converted"].includes(l.status);

// Lightweight lead KPIs for the top of the centre (efficient count-only queries).
export async function loadLeadStats(): Promise<Record<string, number>> {
  const sb = getSupabase();
  const todayISO = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const head = { count: "exact" as const, head: true };
  const [total, unassigned, todayNew, dueFollow, converted, lost] = await Promise.all([
    sb.from("leads").select("id", head),
    sb.from("leads").select("id", head).is("assigned_teacher_id", null).not("status", "in", "(converted,lost,not_interested,duplicate)"),
    sb.from("leads").select("id", head).gte("created_at", todayISO),
    sb.from("leads").select("id", head).not("next_follow_up_at", "is", null).lte("next_follow_up_at", new Date().toISOString()),
    sb.from("leads").select("id", head).eq("status", "converted"),
    sb.from("leads").select("id", head).in("status", ["lost", "not_interested"]),
  ]);
  return {
    total: total.count ?? 0, unassigned: unassigned.count ?? 0, today: todayNew.count ?? 0,
    dueFollow: dueFollow.count ?? 0, converted: converted.count ?? 0, lost: lost.count ?? 0,
  };
}
