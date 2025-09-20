import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

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

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const marketer_id = searchParams.get('marketer_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const search = searchParams.get('search');

    // Build query
    let query = supabaseAdmin
      .from('submissions')
      .select(`
        *,
        user:users(id, name, email, role, created_at, updated_at)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (marketer_id) {
      query = query.eq('user_id', marketer_id);
    }
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%,project_interest.ilike.%${search}%`);
    }

    const { data: submissions, error } = await query;

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
