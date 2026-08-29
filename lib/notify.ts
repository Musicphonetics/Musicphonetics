"use client";

import { getSupabase } from "./supabase/client";
import type { Notification, NotificationType, Role } from "./supabase/types";

// In-app notifications. Reads/writes go through the anon client under RLS:
// a recipient reads & updates only their own; a sender inserts as themselves.

export const NOTIF_LABEL: Record<NotificationType, string> = {
  class_reminder: "Class reminder",
  homework_added: "Homework added",
  class_rescheduled: "Class rescheduled",
  class_cancelled: "Class cancelled",
  payment_due: "Payment due",
  payment_received: "Payment received",
  monthly_report_ready: "Monthly report ready",
  teacher_assigned: "Teacher assigned",
  teacher_changed: "Teacher changed",
  director_message: "Message from the Director",
  general_announcement: "Announcement",
};

// The signed-in user's own id. The bell is personal: an owner can *read* every
// notification via RLS, but only ever marks their OWN rows read, so we must
// scope the list/count to the recipient. Without this the owner's bell shows
// everyone's notifications and none of them can be cleared.
async function myId(): Promise<string | null> {
  const { data: { session } } = await getSupabase().auth.getSession();
  return session?.user?.id ?? null;
}

export async function listNotifications(limit = 50): Promise<Notification[]> {
  const uid = await myId();
  if (!uid) return [];
  const nowIso = new Date().toISOString();
  const { data } = await getSupabase()
    .from("notifications")
    .select("*")
    .eq("recipient_id", uid)
    .or(`expires_at.is.null,expires_at.gte.${nowIso}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Notification[]) ?? [];
}

export async function unreadCount(): Promise<number> {
  const uid = await myId();
  if (!uid) return 0;
  const nowIso = new Date().toISOString();
  const { count } = await getSupabase()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", uid)
    .eq("is_read", false)
    .or(`expires_at.is.null,expires_at.gte.${nowIso}`);
  return count ?? 0;
}

// Read/ack state changes go through SECURITY DEFINER functions, recipients have
// no direct UPDATE grant, so they can only flip read/ack on their own rows.
export async function markRead(id: string): Promise<void> {
  await getSupabase().rpc("mp_mark_notification_read", { p_notification_id: id });
}

export async function markAllRead(): Promise<void> {
  await getSupabase().rpc("mp_mark_all_notifications_read");
}

export async function acknowledge(id: string): Promise<void> {
  await getSupabase().rpc("mp_ack_notification", { p_notification_id: id });
}

export interface NewNotification {
  recipient_id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  role?: Role | null;
  action_url?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  must_ack?: boolean;
  expires_at?: string | null;
}

// Send one or many notifications (sender = current user, enforced by RLS).
export async function sendNotifications(items: NewNotification[]): Promise<{ ok: boolean; error?: string }> {
  const { data: { session } } = await getSupabase().auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: "Not signed in." };
  const rows = items.map((n) => ({ ...n, created_by: uid }));
  const { error } = await getSupabase().from("notifications").insert(rows);
  return error ? { ok: false, error: error.message } : { ok: true };
}
