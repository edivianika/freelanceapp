export type UserRole = 'admin' | 'marketer';
export type SubmissionStatus = 'pending' | 'own' | 'owned' | 'duplicate' | 'expired' | 'hot_lead';
export type FollowUpStatus = 'follow-up' | 'pending' | 'no_response' | 'closing';

export interface User {
  id: string;
  name: string;
  phone?: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ProjectInterest {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  project_interest_id: string;
  project_interest?: ProjectInterest;
  notes?: string;
  status: SubmissionStatus;
  follow_up_status?: FollowUpStatus;
  is_hot_lead: boolean;
  ownership_expires_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  files?: SubmissionFile[];
  // Duplicate tracking
  original_submission_id?: string;
  duplicate_tier?: number;
  duplicate_chain?: SubmissionDuplicateInfo[];
}

export interface SubmissionDuplicateInfo {
  id: string;
  user_name: string;
  user_email: string;
  tier: number;
  created_at: string;
  status: SubmissionStatus;
}

export interface SubmissionFile {
  id: string;
  submission_id: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export interface StatusLog {
  id: string;
  submission_id: string;
  status: SubmissionStatus;
  follow_up_status?: FollowUpStatus;
  updated_at: string;
}

export interface OverrideLog {
  id: string;
  admin_id: string;
  submission_id: string;
  old_owner_id?: string;
  new_owner_id: string;
  reason: string;
  created_at: string;
  admin?: User;
  old_owner?: User;
  new_owner?: User;
  submission?: Submission;
}

export interface CreateSubmissionData {
  name: string;
  phone_number: string;
  project_interest: string;
  notes?: string;
  files?: File[];
}

export interface UpdateSubmissionData {
  follow_up_status?: FollowUpStatus;
}

export interface OverrideSubmissionData {
  submission_id: string;
  new_owner_id: string;
  reason: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

export interface DashboardStats {
  total_submissions: number;
  valid_submissions: number;
  duplicate_submissions: number;
  hot_leads: number;
  expired_submissions: number;
  total_marketers: number;
}

export interface FilterOptions {
  status?: SubmissionStatus;
  marketer_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}


