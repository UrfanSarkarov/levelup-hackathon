// ── Role & Status Enums ─────────────────────────────────────────────

export type AppRole =
  | 'super_admin'
  | 'trainer'
  | 'mentor'
  | 'jury'
  | 'team_member';

export type HackathonPhase =
  | 'draft'
  | 'registration_open'
  | 'registration_closed'
  | 'selection'
  | 'training'
  | 'sprint'
  | 'judging'
  | 'completed'
  | 'archived';

export type TeamStatus =
  | 'draft'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'active'
  | 'submitted'
  | 'disqualified';

export type SessionType = 'training' | 'mentoring' | 'workshop';

// ── Database Row Interfaces ─────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: AppRole;
  phone: string | null;
  bio: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hackathon {
  id: string;
  title: string;
  description: string | null;
  phase: HackathonPhase;
  start_date: string;
  end_date: string;
  registration_deadline: string | null;
  max_teams: number | null;
  max_team_size: number;
  min_team_size: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  description: string | null;
  status: TeamStatus;
  project_title: string | null;
  project_description: string | null;
  invite_code: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  is_captain: boolean;
  joined_at: string;
}

export interface Registration {
  id: string;
  hackathon_id: string;
  user_id: string;
  team_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  motivation: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  hackathon_id: string;
  title: string;
  description: string | null;
  type: SessionType;
  host_id: string;
  location: string | null;
  meeting_url: string | null;
  start_time: string;
  end_time: string;
  max_attendees: number | null;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionBooking {
  id: string;
  session_id: string;
  user_id: string;
  team_id: string | null;
  status: 'booked' | 'cancelled' | 'attended' | 'no_show';
  notes: string | null;
  created_at: string;
}

export interface JudgingRound {
  id: string;
  hackathon_id: string;
  name: string;
  description: string | null;
  round_number: number;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
  created_at: string;
}

export interface JudgingCriteria {
  id: string;
  round_id: string;
  name: string;
  description: string | null;
  max_score: number;
  weight: number;
  order: number;
}

export interface JudgeAssignment {
  id: string;
  round_id: string;
  judge_id: string;
  team_id: string;
  is_completed: boolean;
  assigned_at: string;
}

export interface Score {
  id: string;
  assignment_id: string;
  criteria_id: string;
  score: number;
  comment: string | null;
  scored_at: string;
}

export interface Submission {
  id: string;
  hackathon_id: string;
  team_id: string;
  title: string;
  description: string | null;
  demo_url: string | null;
  repo_url: string | null;
  presentation_url: string | null;
  file_urls: string[];
  submitted_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  hackathon_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  link: string | null;
  created_at: string;
}
