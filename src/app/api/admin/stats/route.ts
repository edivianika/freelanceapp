import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vejrtxoptwdugqqynsij.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlanJ0eG9wdHdkdWdxcXluc2lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM4NjYyNiwiZXhwIjoyMDcyOTYyNjI2fQ.TqfWkGnfg9KeWX61iJPEZ3NwgMHQjTNKBA0iT9uZwzA'
);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here_change_this_in_production';

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

    // Get all submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('id, status, is_hot_lead, created_at');

    if (submissionsError) {
      return NextResponse.json({ error: submissionsError.message }, { status: 400 });
    }

    // Get all marketers
    const { data: marketers, error: marketersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'marketer');

    if (marketersError) {
      return NextResponse.json({ error: marketersError.message }, { status: 400 });
    }

    // Calculate stats
    const totalSubmissions = submissions.length;
    const validSubmissions = submissions.filter(s => s.status === 'own' || s.status === 'owned').length;
    const duplicateSubmissions = submissions.filter(s => s.status === 'duplicate').length;
    const hotLeads = submissions.filter(s => s.is_hot_lead).length;
    const expiredSubmissions = submissions.filter(s => s.status === 'expired').length;
    const totalMarketers = marketers.length;

    const stats = {
      total_submissions: totalSubmissions,
      valid_submissions: validSubmissions,
      duplicate_submissions: duplicateSubmissions,
      hot_leads: hotLeads,
      expired_submissions: expiredSubmissions,
      total_marketers: totalMarketers
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
