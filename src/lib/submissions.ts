import { supabase, supabaseAdmin } from './supabase';
import { Submission, CreateSubmissionData, UpdateSubmissionData, FilterOptions, DashboardStats } from '@/types';

export async function createSubmission(
  userId: string, 
  submissionData: CreateSubmissionData
): Promise<Submission> {
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .insert({
      user_id: userId,
      name: submissionData.name,
      phone_number: submissionData.phone_number,
      project_interest: submissionData.project_interest,
      notes: submissionData.notes
    })
    .select(`
      *,
      user:users(*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create submission: ${error.message}`);
  }

  return data;
}

export async function getSubmissionsByUser(
  userId: string,
  filters?: FilterOptions
): Promise<Submission[]> {
  let query = supabase
    .from('submissions')
    .select(`
      *,
      user:users(*),
      files:submission_files(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%,project_interest.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }

  return data || [];
}

export async function getAllSubmissions(filters?: FilterOptions): Promise<Submission[]> {
  let query = supabaseAdmin
    .from('submissions')
    .select(`
      *,
      user:users(*),
      files:submission_files(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.marketer_id) {
    query = query.eq('user_id', filters.marketer_id);
  }

  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%,project_interest.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }

  return data || [];
}

export async function updateSubmission(
  submissionId: string,
  userId: string,
  updateData: UpdateSubmissionData
): Promise<Submission> {
  const { data, error } = await supabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId)
    .eq('user_id', userId)
    .select(`
      *,
      user:users(*),
      files:submission_files(*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update submission: ${error.message}`);
  }

  return data;
}

export async function getHotLeads(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      user:users(*),
      files:submission_files(*)
    `)
    .eq('is_hot_lead', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch hot leads: ${error.message}`);
  }

  return data || [];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data: submissions, error: submissionsError } = await supabaseAdmin
    .from('submissions')
    .select('status');

  if (submissionsError) {
    throw new Error(`Failed to fetch submission stats: ${submissionsError.message}`);
  }

  const { data: marketers, error: marketersError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'marketer');

  if (marketersError) {
    throw new Error(`Failed to fetch marketer stats: ${marketersError.message}`);
  }

  const stats = submissions?.reduce((acc, submission) => {
    acc.total_submissions++;
    
    switch (submission.status) {
      case 'own':
        acc.valid_submissions++;
        break;
      case 'duplicate':
        acc.duplicate_submissions++;
        break;
      case 'expired':
        acc.expired_submissions++;
        break;
      case 'hot_lead':
        acc.hot_leads++;
        break;
    }
    
    return acc;
  }, {
    total_submissions: 0,
    valid_submissions: 0,
    duplicate_submissions: 0,
    hot_leads: 0,
    expired_submissions: 0,
    total_marketers: marketers?.length || 0
  });

  return stats || {
    total_submissions: 0,
    valid_submissions: 0,
    duplicate_submissions: 0,
    hot_leads: 0,
    expired_submissions: 0,
    total_marketers: 0
  };
}

export async function uploadSubmissionFile(
  submissionId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${submissionId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('submission-files')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('submission-files')
    .getPublicUrl(fileName);

  // Save file record to database
  const { error: dbError } = await supabase
    .from('submission_files')
    .insert({
      submission_id: submissionId,
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type
    });

  if (dbError) {
    throw new Error(`Failed to save file record: ${dbError.message}`);
  }

  return publicUrl;
}


