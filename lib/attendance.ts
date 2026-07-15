import type { AttendanceStatus, ClassUpdate } from "./supabase/types";

// Attendance & class accounting. Progress and "classes completed" derive ONLY
// from valid completed classes — a scheduled/cancelled/rescheduled class never
// silently counts as done.

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  "scheduled", "present", "absent", "cancelled_by_parent",
  "cancelled_by_teacher", "rescheduled", "holiday", "no_show",
];

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  scheduled: "Scheduled",
  present: "Present",
  absent: "Absent",
  cancelled_by_parent: "Cancelled by parent",
  cancelled_by_teacher: "Cancelled by teacher",
  rescheduled: "Rescheduled",
  holiday: "Holiday",
  no_show: "No-show",
};

type ClassRow = Pick<ClassUpdate, "attendance_status" | "counts_toward_cycle" | "class_status"> &
  Partial<Pick<ClassUpdate, "makeup_required" | "makeup_completed">>;

// A valid completed class: teacher marked the student PRESENT and it counts
// toward the paid cycle. Legacy rows (no attendance_status) fall back to the
// old class_status = 'Completed'.
export function isValidCompleted(c: ClassRow): boolean {
  if (c.attendance_status) return c.attendance_status === "present" && c.counts_toward_cycle !== false;
  return c.class_status === "Completed";
}

// A makeup is due when required and not yet completed.
export function makeupDue(c: ClassRow): boolean {
  return c.makeup_required === true && c.makeup_completed !== true;
}

export function countValidCompleted(rows: ClassRow[]): number {
  return rows.reduce((n, c) => n + (isValidCompleted(c) ? 1 : 0), 0);
}

export interface AttendanceStats {
  total: number;
  completed: number;
  present: number;
  absent: number;
  cancelledByParent: number;
  cancelledByTeacher: number;
  rescheduled: number;
  noShow: number;
  holiday: number;
  makeupsDue: number;
  attendancePercent: number; // present / (present + absent + no_show)
}

export function attendanceStats(rows: ClassRow[]): AttendanceStats {
  const s: AttendanceStats = {
    total: rows.length, completed: 0, present: 0, absent: 0, cancelledByParent: 0,
    cancelledByTeacher: 0, rescheduled: 0, noShow: 0, holiday: 0, makeupsDue: 0, attendancePercent: 0,
  };
  for (const c of rows) {
    if (isValidCompleted(c)) s.completed += 1;
    if (makeupDue(c)) s.makeupsDue += 1;
    switch (c.attendance_status) {
      case "present": s.present += 1; break;
      case "absent": s.absent += 1; break;
      case "cancelled_by_parent": s.cancelledByParent += 1; break;
      case "cancelled_by_teacher": s.cancelledByTeacher += 1; break;
      case "rescheduled": s.rescheduled += 1; break;
      case "no_show": s.noShow += 1; break;
      case "holiday": s.holiday += 1; break;
      default:
        if (!c.attendance_status && c.class_status === "Completed") s.present += 1;
    }
  }
  const attended = s.present + s.absent + s.noShow;
  s.attendancePercent = attended > 0 ? Math.round((s.present / attended) * 100) : 0;
  return s;
}
