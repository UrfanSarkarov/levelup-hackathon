-- ============================================================================
-- Level UP Urban Innovation Hackathon -- Initial Schema Migration
-- ============================================================================

-- --------------------------------------------------------------------------
-- 0. Extensions
-- --------------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- --------------------------------------------------------------------------
-- 1. ENUMS
-- --------------------------------------------------------------------------

create type public.app_role as enum (
  'super_admin',
  'trainer',
  'mentor',
  'jury',
  'team_member'
);

create type public.hackathon_phase as enum (
  'draft',
  'registration_open',
  'registration_closed',
  'selection',
  'training',
  'sprint',
  'judging',
  'completed',
  'archived'
);

create type public.team_status as enum (
  'draft',
  'pending',
  'accepted',
  'rejected',
  'waitlisted',
  'active',
  'submitted',
  'disqualified'
);

create type public.session_type as enum (
  'training',
  'mentoring',
  'workshop'
);

create type public.notification_type as enum (
  'info',
  'warning',
  'success',
  'error',
  'team_invite',
  'team_update',
  'phase_change',
  'session_reminder',
  'judging_assigned',
  'submission_update',
  'announcement'
);

create type public.member_role as enum (
  'leader',
  'member'
);

-- --------------------------------------------------------------------------
-- 2. TABLES
-- --------------------------------------------------------------------------

-- ---- profiles -----------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text,
  avatar_url  text,
  phone       text,
  bio         text,
  organization text,
  expertise_area text,
  credentials jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ---- user_roles ---------------------------------------------------------
create table public.user_roles (
  id       bigint generated always as identity primary key,
  user_id  uuid not null references auth.users(id) on delete cascade,
  role     public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- ---- role_permissions ---------------------------------------------------
create table public.role_permissions (
  id         bigint generated always as identity primary key,
  role       public.app_role not null,
  permission text not null,
  unique (role, permission)
);

alter table public.role_permissions enable row level security;

-- Seed role_permissions
insert into public.role_permissions (role, permission) values
  -- super_admin: full access
  ('super_admin', 'hackathons.create'),
  ('super_admin', 'hackathons.update'),
  ('super_admin', 'hackathons.delete'),
  ('super_admin', 'hackathons.manage_phases'),
  ('super_admin', 'teams.view_all'),
  ('super_admin', 'teams.manage'),
  ('super_admin', 'teams.approve'),
  ('super_admin', 'teams.reject'),
  ('super_admin', 'users.manage'),
  ('super_admin', 'users.assign_roles'),
  ('super_admin', 'sessions.create'),
  ('super_admin', 'sessions.update'),
  ('super_admin', 'sessions.delete'),
  ('super_admin', 'judging.manage'),
  ('super_admin', 'judging.view_scores'),
  ('super_admin', 'submissions.view_all'),
  ('super_admin', 'notifications.broadcast'),
  ('super_admin', 'registrations.manage'),
  ('super_admin', 'analytics.view'),
  -- trainer
  ('trainer', 'sessions.create'),
  ('trainer', 'sessions.update'),
  ('trainer', 'sessions.view_bookings'),
  ('trainer', 'teams.view_all'),
  -- mentor
  ('mentor', 'sessions.create'),
  ('mentor', 'sessions.update'),
  ('mentor', 'sessions.view_bookings'),
  ('mentor', 'teams.view_assigned'),
  -- jury
  ('jury', 'judging.score'),
  ('jury', 'judging.view_assigned'),
  ('jury', 'submissions.view_assigned'),
  -- team_member
  ('team_member', 'teams.create'),
  ('team_member', 'teams.update_own'),
  ('team_member', 'teams.view_own'),
  ('team_member', 'sessions.book'),
  ('team_member', 'submissions.create'),
  ('team_member', 'submissions.update_own'),
  ('team_member', 'registrations.submit');

-- ---- hackathons ---------------------------------------------------------
create table public.hackathons (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique not null,
  description      text,
  current_phase    public.hackathon_phase not null default 'draft',
  max_teams        int,
  min_team_size    int not null default 2,
  max_team_size    int not null default 5,
  registration_start timestamptz,
  registration_end   timestamptz,
  start_date       timestamptz,
  end_date         timestamptz,
  created_by       uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.hackathons enable row level security;

-- ---- phase_features -----------------------------------------------------
create table public.phase_features (
  id            bigint generated always as identity primary key,
  hackathon_id  uuid not null references public.hackathons(id) on delete cascade,
  phase         public.hackathon_phase not null,
  feature_key   text not null,
  enabled       boolean not null default true,
  unique (hackathon_id, phase, feature_key)
);

alter table public.phase_features enable row level security;

-- ---- teams --------------------------------------------------------------
create table public.teams (
  id            uuid primary key default gen_random_uuid(),
  hackathon_id  uuid not null references public.hackathons(id) on delete cascade,
  name          text not null,
  track         text,
  description   text,
  status        public.team_status not null default 'draft',
  invite_code   text unique default encode(gen_random_bytes(6), 'hex'),
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (hackathon_id, name)
);

alter table public.teams enable row level security;

-- ---- team_members -------------------------------------------------------
create table public.team_members (
  id          bigint generated always as identity primary key,
  team_id     uuid not null references public.teams(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  role        public.member_role not null default 'member',
  full_name   text not null,
  email       text not null,
  university  text,
  phone       text,
  joined_at   timestamptz not null default now(),
  unique (team_id, email)
);

alter table public.team_members enable row level security;

-- ---- registrations ------------------------------------------------------
create table public.registrations (
  id            uuid primary key default gen_random_uuid(),
  hackathon_id  uuid not null references public.hackathons(id) on delete cascade,
  team_id       uuid not null references public.teams(id) on delete cascade,
  form_data     jsonb not null default '{}'::jsonb,
  submitted_at  timestamptz,
  is_locked     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (hackathon_id, team_id)
);

alter table public.registrations enable row level security;

-- ---- sessions -----------------------------------------------------------
create table public.sessions (
  id            uuid primary key default gen_random_uuid(),
  hackathon_id  uuid not null references public.hackathons(id) on delete cascade,
  title         text not null,
  description   text,
  session_type  public.session_type not null,
  host_id       uuid references auth.users(id) on delete set null,
  session_date  date not null,
  start_time    time not null,
  end_time      time not null,
  location      text,
  is_online     boolean not null default false,
  meet_link     text,
  capacity      int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.sessions enable row level security;

-- ---- session_bookings ---------------------------------------------------
create table public.session_bookings (
  id          bigint generated always as identity primary key,
  session_id  uuid not null references public.sessions(id) on delete cascade,
  team_id     uuid not null references public.teams(id) on delete cascade,
  booked_by   uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'attended')),
  created_at  timestamptz not null default now(),
  unique (session_id, team_id)
);

alter table public.session_bookings enable row level security;

-- ---- judging_rounds -----------------------------------------------------
create table public.judging_rounds (
  id            uuid primary key default gen_random_uuid(),
  hackathon_id  uuid not null references public.hackathons(id) on delete cascade,
  round_number  int not null,
  name          text not null,
  is_active     boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (hackathon_id, round_number)
);

alter table public.judging_rounds enable row level security;

-- ---- judging_criteria ---------------------------------------------------
create table public.judging_criteria (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references public.judging_rounds(id) on delete cascade,
  name        text not null,
  description text,
  weight      numeric(5,2) not null default 1.0,
  max_score   int not null default 10
);

alter table public.judging_criteria enable row level security;

-- ---- judge_assignments --------------------------------------------------
create table public.judge_assignments (
  id        uuid primary key default gen_random_uuid(),
  round_id  uuid not null references public.judging_rounds(id) on delete cascade,
  judge_id  uuid not null references auth.users(id) on delete cascade,
  team_id   uuid not null references public.teams(id) on delete cascade,
  status    text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  unique (round_id, judge_id, team_id)
);

alter table public.judge_assignments enable row level security;

-- ---- scores -------------------------------------------------------------
create table public.scores (
  id             bigint generated always as identity primary key,
  assignment_id  uuid not null references public.judge_assignments(id) on delete cascade,
  criterion_id   uuid not null references public.judging_criteria(id) on delete cascade,
  judge_id       uuid not null references auth.users(id) on delete cascade,
  score          numeric(5,2) not null check (score >= 0),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (assignment_id, criterion_id)
);

alter table public.scores enable row level security;

-- ---- submissions --------------------------------------------------------
create table public.submissions (
  id            uuid primary key default gen_random_uuid(),
  hackathon_id  uuid not null references public.hackathons(id) on delete cascade,
  team_id       uuid not null references public.teams(id) on delete cascade,
  title         text not null,
  description   text,
  problem       text,
  solution      text,
  tech_stack    text[],
  demo_url      text,
  repo_url      text,
  video_url     text,
  presentation_url text,
  is_draft      boolean not null default true,
  submitted_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (hackathon_id, team_id)
);

alter table public.submissions enable row level security;

-- ---- submission_files ---------------------------------------------------
create table public.submission_files (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions(id) on delete cascade,
  file_name      text not null,
  file_path      text not null,
  file_size      bigint,
  mime_type      text,
  category       text not null default 'other' check (category in ('presentation', 'document', 'image', 'video', 'archive', 'other')),
  uploaded_by    uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);

alter table public.submission_files enable row level security;

-- ---- notifications ------------------------------------------------------
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  hackathon_id  uuid references public.hackathons(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          public.notification_type not null default 'info',
  title         text not null,
  body          text,
  link          text,
  data          jsonb default '{}'::jsonb,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- --------------------------------------------------------------------------
-- 3. INDEXES on foreign keys and common lookups
-- --------------------------------------------------------------------------

-- profiles
create index idx_profiles_email on public.profiles(email);

-- user_roles
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role);

-- role_permissions
create index idx_role_permissions_role on public.role_permissions(role);

-- hackathons
create index idx_hackathons_slug on public.hackathons(slug);
create index idx_hackathons_current_phase on public.hackathons(current_phase);
create index idx_hackathons_created_by on public.hackathons(created_by);

-- phase_features
create index idx_phase_features_hackathon on public.phase_features(hackathon_id);
create index idx_phase_features_phase on public.phase_features(hackathon_id, phase);

-- teams
create index idx_teams_hackathon on public.teams(hackathon_id);
create index idx_teams_status on public.teams(status);
create index idx_teams_created_by on public.teams(created_by);
create index idx_teams_invite_code on public.teams(invite_code);

-- team_members
create index idx_team_members_team on public.team_members(team_id);
create index idx_team_members_user on public.team_members(user_id);

-- registrations
create index idx_registrations_hackathon on public.registrations(hackathon_id);
create index idx_registrations_team on public.registrations(team_id);

-- sessions
create index idx_sessions_hackathon on public.sessions(hackathon_id);
create index idx_sessions_host on public.sessions(host_id);
create index idx_sessions_date on public.sessions(session_date);

-- session_bookings
create index idx_session_bookings_session on public.session_bookings(session_id);
create index idx_session_bookings_team on public.session_bookings(team_id);
create index idx_session_bookings_booked_by on public.session_bookings(booked_by);

-- judging_rounds
create index idx_judging_rounds_hackathon on public.judging_rounds(hackathon_id);

-- judging_criteria
create index idx_judging_criteria_round on public.judging_criteria(round_id);

-- judge_assignments
create index idx_judge_assignments_round on public.judge_assignments(round_id);
create index idx_judge_assignments_judge on public.judge_assignments(judge_id);
create index idx_judge_assignments_team on public.judge_assignments(team_id);

-- scores
create index idx_scores_assignment on public.scores(assignment_id);
create index idx_scores_criterion on public.scores(criterion_id);
create index idx_scores_judge on public.scores(judge_id);

-- submissions
create index idx_submissions_hackathon on public.submissions(hackathon_id);
create index idx_submissions_team on public.submissions(team_id);

-- submission_files
create index idx_submission_files_submission on public.submission_files(submission_id);
create index idx_submission_files_uploaded_by on public.submission_files(uploaded_by);

-- notifications
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_hackathon on public.notifications(hackathon_id);
create index idx_notifications_unread on public.notifications(user_id, is_read) where not is_read;

-- --------------------------------------------------------------------------
-- 4. VIEWS
-- --------------------------------------------------------------------------

create or replace view public.team_aggregate_scores as
select
  ja.round_id,
  ja.team_id,
  jr.hackathon_id,
  jr.round_number,
  jr.name as round_name,
  t.name  as team_name,
  count(distinct ja.judge_id)                                        as judge_count,
  round(avg(
    s.score * jc.weight / jc.max_score * 100
  )::numeric, 2)                                                     as weighted_avg,
  rank() over (
    partition by ja.round_id
    order by avg(s.score * jc.weight / jc.max_score * 100) desc nulls last
  )                                                                   as rank
from public.judge_assignments ja
join public.judging_rounds jr on jr.id = ja.round_id
join public.teams t           on t.id  = ja.team_id
left join public.scores s     on s.assignment_id = ja.id
left join public.judging_criteria jc on jc.id = s.criterion_id
where ja.status = 'completed'
group by ja.round_id, ja.team_id, jr.hackathon_id, jr.round_number, jr.name, t.name;

-- --------------------------------------------------------------------------
-- 5. FUNCTIONS & TRIGGERS
-- --------------------------------------------------------------------------

-- ---- authorize() — RLS helper: check if current user has a given role ----
create or replace function public.authorize(required_role public.app_role)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = required_role
  );
end;
$$;

-- ---- is_feature_enabled() — check if a phase feature is turned on ------
create or replace function public.is_feature_enabled(
  _hackathon_id uuid,
  _feature_key  text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  _phase public.hackathon_phase;
  _enabled boolean;
begin
  select current_phase into _phase
  from public.hackathons
  where id = _hackathon_id;

  if _phase is null then
    return false;
  end if;

  select enabled into _enabled
  from public.phase_features
  where hackathon_id = _hackathon_id
    and phase = _phase
    and feature_key = _feature_key;

  -- if no row exists, feature is disabled by default
  return coalesce(_enabled, false);
end;
$$;

-- ---- handle_new_user() — auto-create profile + default role on signup ---
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );

  -- assign default role
  insert into public.user_roles (user_id, role)
  values (new.id, 'team_member');

  return new;
end;
$$;

-- trigger on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- check_team_size() — prevent exceeding hackathon max_team_size ------
create or replace function public.check_team_size()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _max_size int;
  _current  int;
begin
  select h.max_team_size into _max_size
  from public.teams t
  join public.hackathons h on h.id = t.hackathon_id
  where t.id = new.team_id;

  select count(*) into _current
  from public.team_members
  where team_id = new.team_id;

  if _current >= _max_size then
    raise exception 'Team has reached the maximum size of % members', _max_size;
  end if;

  return new;
end;
$$;

create or replace trigger trg_check_team_size
  before insert on public.team_members
  for each row execute function public.check_team_size();

-- ---- check_trainer_session_limit() — max 3 sessions per day per host ----
create or replace function public.check_trainer_session_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _count int;
begin
  if new.host_id is null then
    return new;
  end if;

  select count(*) into _count
  from public.sessions
  where host_id = new.host_id
    and session_date = new.session_date
    and (tg_op = 'INSERT' or id <> new.id);

  if _count >= 3 then
    raise exception 'Host already has 3 sessions on this date';
  end if;

  return new;
end;
$$;

create or replace trigger trg_check_trainer_session_limit
  before insert or update on public.sessions
  for each row execute function public.check_trainer_session_limit();

-- ---- book_session() — atomic booking preventing race conditions ---------
create or replace function public.book_session(
  _session_id uuid,
  _team_id    uuid
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  _capacity   int;
  _booked     int;
  _booking_id bigint;
begin
  -- lock the session row to prevent concurrent overbooking
  select capacity into _capacity
  from public.sessions
  where id = _session_id
  for update;

  if not found then
    raise exception 'Session not found';
  end if;

  select count(*) into _booked
  from public.session_bookings
  where session_id = _session_id
    and status = 'confirmed';

  if _capacity is not null and _booked >= _capacity then
    raise exception 'Session is fully booked';
  end if;

  -- check for existing booking
  if exists (
    select 1 from public.session_bookings
    where session_id = _session_id and team_id = _team_id and status = 'confirmed'
  ) then
    raise exception 'Team already has a booking for this session';
  end if;

  insert into public.session_bookings (session_id, team_id, booked_by, status)
  values (_session_id, _team_id, auth.uid(), 'confirmed')
  returning id into _booking_id;

  return _booking_id;
end;
$$;

-- ---- custom_access_token_hook — inject app_role into JWT claims ---------
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  claims    jsonb;
  user_role public.app_role;
begin
  claims := event -> 'claims';

  -- pick the highest-priority role for the user
  select role into user_role
  from public.user_roles
  where user_id = (event ->> 'user_id')::uuid
  order by
    case role
      when 'super_admin' then 1
      when 'trainer'     then 2
      when 'mentor'      then 3
      when 'jury'        then 4
      when 'team_member' then 5
    end
  limit 1;

  claims := jsonb_set(claims, '{user_role}', coalesce(to_jsonb(user_role), '"team_member"'::jsonb));

  -- also store all roles as an array
  claims := jsonb_set(
    claims,
    '{user_roles}',
    coalesce(
      (select jsonb_agg(role) from public.user_roles where user_id = (event ->> 'user_id')::uuid),
      '["team_member"]'::jsonb
    )
  );

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- grant execute to supabase_auth_admin so the hook can be invoked
grant execute on function public.custom_access_token_hook to supabase_auth_admin;

-- revoke from public
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

-- grant usage on public schema to supabase_auth_admin
grant usage on schema public to supabase_auth_admin;

-- ---- updated_at auto-setter trigger ------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_hackathons_updated_at
  before update on public.hackathons
  for each row execute function public.set_updated_at();

create trigger trg_teams_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

create trigger trg_registrations_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

create trigger trg_sessions_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

create trigger trg_scores_updated_at
  before update on public.scores
  for each row execute function public.set_updated_at();

create trigger trg_submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY POLICIES
-- --------------------------------------------------------------------------

-- ---- profiles -----------------------------------------------------------
create policy "Users can view any profile"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.authorize('super_admin'));

-- ---- user_roles ---------------------------------------------------------
create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Users can view own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- ---- role_permissions ---------------------------------------------------
create policy "Anyone authenticated can read permissions"
  on public.role_permissions for select
  to authenticated
  using (true);

create policy "Only admins can manage permissions"
  on public.role_permissions for all
  to authenticated
  using (public.authorize('super_admin'));

-- ---- hackathons ---------------------------------------------------------
create policy "Anyone can view hackathons"
  on public.hackathons for select
  to authenticated
  using (true);

create policy "Admins can manage hackathons"
  on public.hackathons for all
  to authenticated
  using (public.authorize('super_admin'));

-- ---- phase_features -----------------------------------------------------
create policy "Anyone can view phase_features"
  on public.phase_features for select
  to authenticated
  using (true);

create policy "Admins can manage phase_features"
  on public.phase_features for all
  to authenticated
  using (public.authorize('super_admin'));

-- ---- teams --------------------------------------------------------------
create policy "Admins can manage all teams"
  on public.teams for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Members can view own team"
  on public.teams for select
  to authenticated
  using (
    id in (select team_id from public.team_members where user_id = auth.uid())
  );

create policy "Trainers and mentors can view teams"
  on public.teams for select
  to authenticated
  using (
    public.authorize('trainer') or public.authorize('mentor')
  );

create policy "Users can create teams"
  on public.teams for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Team leaders can update own team"
  on public.teams for update
  to authenticated
  using (
    id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role = 'leader'
    )
  );

-- ---- team_members -------------------------------------------------------
create policy "Admins can manage all team members"
  on public.team_members for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Team members can view own team members"
  on public.team_members for select
  to authenticated
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

create policy "Team leaders can add members"
  on public.team_members for insert
  to authenticated
  with check (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role = 'leader'
    )
    or
    -- first member (team creator) can add themselves
    not exists (select 1 from public.team_members where team_id = team_members.team_id)
  );

create policy "Trainers can view team members"
  on public.team_members for select
  to authenticated
  using (
    public.authorize('trainer') or public.authorize('mentor')
  );

-- ---- registrations ------------------------------------------------------
create policy "Admins can manage registrations"
  on public.registrations for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Team leaders can manage own registration"
  on public.registrations for all
  to authenticated
  using (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role = 'leader'
    )
  );

create policy "Team members can view own registration"
  on public.registrations for select
  to authenticated
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

-- ---- sessions -----------------------------------------------------------
create policy "Anyone can view sessions"
  on public.sessions for select
  to authenticated
  using (true);

create policy "Admins can manage sessions"
  on public.sessions for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Trainers can manage own sessions"
  on public.sessions for insert
  to authenticated
  with check (
    host_id = auth.uid()
    and (public.authorize('trainer') or public.authorize('mentor'))
  );

create policy "Trainers can update own sessions"
  on public.sessions for update
  to authenticated
  using (
    host_id = auth.uid()
    and (public.authorize('trainer') or public.authorize('mentor'))
  );

-- ---- session_bookings ---------------------------------------------------
create policy "Admins can manage all bookings"
  on public.session_bookings for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Users can view own bookings"
  on public.session_bookings for select
  to authenticated
  using (booked_by = auth.uid());

create policy "Session hosts can view bookings"
  on public.session_bookings for select
  to authenticated
  using (
    session_id in (select id from public.sessions where host_id = auth.uid())
  );

-- ---- judging_rounds -----------------------------------------------------
create policy "Anyone can view judging rounds"
  on public.judging_rounds for select
  to authenticated
  using (true);

create policy "Admins can manage judging rounds"
  on public.judging_rounds for all
  to authenticated
  using (public.authorize('super_admin'));

-- ---- judging_criteria ---------------------------------------------------
create policy "Anyone can view judging criteria"
  on public.judging_criteria for select
  to authenticated
  using (true);

create policy "Admins can manage judging criteria"
  on public.judging_criteria for all
  to authenticated
  using (public.authorize('super_admin'));

-- ---- judge_assignments --------------------------------------------------
create policy "Admins can manage judge assignments"
  on public.judge_assignments for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Judges can view own assignments"
  on public.judge_assignments for select
  to authenticated
  using (judge_id = auth.uid());

-- ---- scores -------------------------------------------------------------
create policy "Admins can manage all scores"
  on public.scores for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Judges can manage own scores"
  on public.scores for all
  to authenticated
  using (judge_id = auth.uid());

-- ---- submissions --------------------------------------------------------
create policy "Admins can manage all submissions"
  on public.submissions for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Team members can view own submission"
  on public.submissions for select
  to authenticated
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

create policy "Team leaders can manage own submission"
  on public.submissions for all
  to authenticated
  using (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role = 'leader'
    )
  );

create policy "Jury can view assigned submissions"
  on public.submissions for select
  to authenticated
  using (
    public.authorize('jury')
    and team_id in (
      select team_id from public.judge_assignments where judge_id = auth.uid()
    )
  );

-- ---- submission_files ---------------------------------------------------
create policy "Admins can manage all submission files"
  on public.submission_files for all
  to authenticated
  using (public.authorize('super_admin'));

create policy "Team members can view own submission files"
  on public.submission_files for select
  to authenticated
  using (
    submission_id in (
      select id from public.submissions
      where team_id in (select team_id from public.team_members where user_id = auth.uid())
    )
  );

create policy "Team members can upload files"
  on public.submission_files for insert
  to authenticated
  with check (uploaded_by = auth.uid());

-- ---- notifications ------------------------------------------------------
create policy "Users can view own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can mark own notifications as read"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Admins can create notifications"
  on public.notifications for insert
  to authenticated
  with check (public.authorize('super_admin'));

-- --------------------------------------------------------------------------
-- 7. REALTIME publication for notifications
-- --------------------------------------------------------------------------

alter publication supabase_realtime add table public.notifications;
