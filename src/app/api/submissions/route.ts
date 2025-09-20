import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Use correct service key from .env
const supabaseAdmin = createClient(
  'https://vejrtxoptwdugqqynsij.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlanJ0eG9wdHdkdWdxcXluc2lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM4NjYyNiwiZXhwIjoyMDcyOTYyNjI2fQ.TqfWkGnfg9KeWX61iJPEZ3NwgMHQjTNKBA0iT9uZwzA',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token) as any;
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: submissions, error } = await supabaseAdmin
      .from('submissions')
      .select(`
        *,
        user:users(id, name, email, role, created_at, updated_at)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

        // For each submission, get duplicate chain if it exists
        const submissionsWithDuplicates = await Promise.all(
          (submissions || []).map(async (submission) => {
            if (submission.status === 'duplicate' || submission.status === 'owned') {
              // Get all submissions with the same phone number AND project interest
              const { data: duplicateChain } = await supabaseAdmin
                .from('submissions')
                .select(`
                  id,
                  user_id,
                  status,
                  project_interest,
                  created_at,
                  user:users(id, name, email, role)
                `)
                .eq('phone_number', submission.phone_number)
                .eq('project_interest', submission.project_interest)
                .order('created_at', { ascending: true });

              if (duplicateChain && duplicateChain.length > 1) {
                // Calculate tier for each submission based on creation order
                const duplicateInfo = duplicateChain.map((dup: any, index: number) => ({
                  id: dup.id,
                  user_name: dup.user?.name || 'Unknown',
                  user_email: dup.user?.email || 'Unknown',
                  tier: index + 1,
                  created_at: dup.created_at,
                  status: dup.status
                }));

                // Find current submission's tier
                const currentTier = duplicateInfo.find(info => info.id === submission.id)?.tier || 1;

                return {
                  ...submission,
                  duplicate_tier: currentTier,
                  duplicate_chain: duplicateInfo
                };
              }
            }
            return {
              ...submission,
              duplicate_tier: 1
            };
          })
        );

    return NextResponse.json(submissionsWithDuplicates);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token) as any;
    console.log('🔍 POST - Decoded user from token:', user);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, phone_number, project_interest, notes } = await request.json();

    if (!name || !phone_number || !project_interest) {
      return NextResponse.json(
        { error: 'Name, phone number, and project interest are required' },
        { status: 400 }
      );
    }

    // Check for existing submissions with same phone number AND project interest
    const { data: existingSubmissions, error: checkError } = await supabaseAdmin
      .from('submissions')
      .select(`
        id,
        user_id,
        status,
        project_interest,
        created_at,
        user:users(id, name, email, role)
      `)
      .eq('phone_number', phone_number)
      .eq('project_interest', project_interest)
      .order('created_at', { ascending: true });

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 400 });
    }

    // Check if current user already owns this data
    const ownExistingSubmission = existingSubmissions?.find(sub => sub.user_id === user.id);
    
    if (ownExistingSubmission) {
      // Block submission - user already owns this data
      return NextResponse.json({ 
        error: 'Data sudah pernah Anda input sebelumnya. Tidak dapat input data yang sama.' 
      }, { status: 409 });
    }

    // Let database handle status with default value
    const submissionData: any = {
      user_id: user.id,
      name,
      phone_number,
      project_interest,
      notes: notes || null
      // status will use database default
    };

    // Determine status based on existing submissions for logging
    let expectedStatus = 'pending'; // Database default
    if (existingSubmissions && existingSubmissions.length > 0) {
      expectedStatus = 'duplicate';
    } else {
      expectedStatus = 'own';
    }

    console.log('🔍 POST - Submission data to insert:', submissionData);
    console.log('🔍 POST - Existing submissions:', existingSubmissions?.length || 0);
    console.log('🔍 POST - Expected status:', expectedStatus);

    const { data: submission, error } = await supabaseAdmin
      .from('submissions')
      .insert(submissionData)
      .select(`
        *,
        user:users(id, name, email, role, created_at, updated_at)
      `)
      .single();

    if (error) {
      console.error('🔍 POST - Insert error:', error);
      console.error('🔍 POST - Insert error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}