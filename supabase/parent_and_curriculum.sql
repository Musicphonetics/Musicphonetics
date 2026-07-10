-- ============================================================================
-- Musicphonetics - Parent Portal + Foundation Journey (curriculum) schema.
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent-ish).
-- Parents are plain Supabase auth users linked to their child via
-- students.parent_id = auth.uid(). No profiles row / role change required.
-- ============================================================================

-- 1) Link a parent auth user to their child/children -------------------------
alter table public.students add column if not exists parent_id uuid;
create index if not exists students_parent_id_idx on public.students (parent_id);

-- 2) Parent read access (RLS policies are additive / OR'd with existing ones) --
-- Parents may READ only their own child's rows. They never write here.
drop policy if exists "parent reads own students" on public.students;
create policy "parent reads own students" on public.students
  for select using (parent_id = auth.uid());

drop policy if exists "parent reads own class_updates" on public.class_updates;
create policy "parent reads own class_updates" on public.class_updates
  for select using (
    student_id in (select id from public.students where parent_id = auth.uid())
  );

drop policy if exists "parent reads own payments" on public.payments;
create policy "parent reads own payments" on public.payments
  for select using (
    student_id in (select id from public.students where parent_id = auth.uid())
  );

-- ============================================================================
-- 3) Foundation Journey curriculum ------------------------------------------
-- ============================================================================
create table if not exists public.curriculum_paths (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  total_classes int not null default 32,
  target_package text,
  upgrade_to_package text,
  is_active boolean not null default true
);

create table if not exists public.curriculum_chapters (
  id uuid primary key default gen_random_uuid(),
  path_id uuid references public.curriculum_paths(id) on delete cascade,
  chapter_number int not null,
  chapter_name text not null,
  start_class int not null,
  end_class int not null,
  goal text,
  parent_description text
);

create table if not exists public.curriculum_milestones (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.curriculum_chapters(id) on delete cascade,
  milestone_title text not null,
  milestone_description text,
  is_required boolean not null default true
);

create table if not exists public.student_curriculum_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade unique,
  path_id uuid references public.curriculum_paths(id),
  starting_chapter int not null default 1,
  ready_for_upgrade boolean not null default false,
  foundation_status text not null default 'In Progress',
  upgrade_recommended_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.student_milestone_checks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  teacher_id uuid,
  class_update_id uuid,
  milestone_id uuid references public.curriculum_milestones(id) on delete cascade,
  checked boolean not null default true,
  teacher_note text,
  checked_at timestamptz not null default now()
);

-- ============================================================================
-- 4) Community + feedback + milestones (parent-safe) ------------------------
-- ============================================================================
create table if not exists public.community_updates (
  id uuid primary key default gen_random_uuid(),
  month text,                 -- e.g. '2026-07'
  headline text not null,     -- anonymised, e.g. "3 beginners completed their first song"
  kind text default 'achievement',
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_feedback (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  parent_id uuid,
  rating int check (rating between 1 and 5),
  feedback text,
  permission_to_feature boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.student_milestones (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  title text not null,
  anonymised_headline text,   -- what may be shown publicly
  achieved_at timestamptz not null default now()
);

-- RLS
alter table public.curriculum_paths            enable row level security;
alter table public.curriculum_chapters         enable row level security;
alter table public.curriculum_milestones       enable row level security;
alter table public.student_curriculum_progress enable row level security;
alter table public.student_milestone_checks    enable row level security;
alter table public.community_updates           enable row level security;
alter table public.parent_feedback             enable row level security;
alter table public.student_milestones          enable row level security;

-- Curriculum definitions are readable by any signed-in user.
drop policy if exists "read curriculum paths" on public.curriculum_paths;
create policy "read curriculum paths" on public.curriculum_paths for select using (auth.role() = 'authenticated');
drop policy if exists "read curriculum chapters" on public.curriculum_chapters;
create policy "read curriculum chapters" on public.curriculum_chapters for select using (auth.role() = 'authenticated');
drop policy if exists "read curriculum milestones" on public.curriculum_milestones;
create policy "read curriculum milestones" on public.curriculum_milestones for select using (auth.role() = 'authenticated');

-- Parent may read their own child's curriculum progress + milestones.
drop policy if exists "parent reads own progress" on public.student_curriculum_progress;
create policy "parent reads own progress" on public.student_curriculum_progress
  for select using (student_id in (select id from public.students where parent_id = auth.uid()));

-- Published community updates are readable by any signed-in user.
drop policy if exists "read community" on public.community_updates;
create policy "read community" on public.community_updates for select using (is_published and auth.role() = 'authenticated');

-- Parent may write feedback for their own child.
drop policy if exists "parent writes feedback" on public.parent_feedback;
create policy "parent writes feedback" on public.parent_feedback
  for insert with check (student_id in (select id from public.students where parent_id = auth.uid()));

-- ============================================================================
-- 5) Seed the Foundation Journey --------------------------------------------
-- ============================================================================
insert into public.curriculum_paths (name, total_classes, target_package, upgrade_to_package)
select 'Foundation Journey', 32, 'Foundation', 'Main Musicphonetics Pathway'
where not exists (select 1 from public.curriculum_paths where name = 'Foundation Journey');

with p as (select id from public.curriculum_paths where name = 'Foundation Journey' limit 1)
insert into public.curriculum_chapters (path_id, chapter_number, chapter_name, start_class, end_class, goal, parent_description)
select p.id, v.n, v.nm, v.sc, v.ec, v.goal, v.pd from p, (values
  (1,'Starting Right',1,8,'Comfort with instrument, posture, basic rhythm and practice routine.','Your child is learning the foundation of sound, rhythm, posture and practice discipline.'),
  (2,'Building Basics',9,16,'Basic notes/chords/scales, rhythm stability, homework habit, first exercise.','The student is moving from comfort to control.'),
  (3,'Musical Confidence',17,24,'Applying basics into songs, timing, confidence, independent practice.','Your child is now building confidence and musical independence.'),
  (4,'Ready for Next Level',25,32,'Foundation review, simple performance piece, Main Pathway readiness.','Your child is finishing the foundation and getting ready for the Main Pathway.')
) as v(n,nm,sc,ec,goal,pd)
where not exists (select 1 from public.curriculum_chapters c join p on c.path_id = p.id where c.chapter_number = v.n);
