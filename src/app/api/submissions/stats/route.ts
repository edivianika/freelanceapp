import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Access token required');
  }

  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as any;
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    const userId = user.id;

    // Single optimized query to get all data at once
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('id, status, is_hot_lead, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions data' },
        { status: 500 }
      );
    }

    // Calculate stats from single query result
    const totalSubmissions = submissions.length;
    
    // Count by status
    const statusCounts = submissions.reduce((acc, submission) => {
      acc[submission.status] = (acc[submission.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count hot leads
    const hotLeadsCount = submissions.filter(s => s.is_hot_lead).length;

    // Count recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSubmissions = submissions.filter(s => 
      new Date(s.created_at) >= sevenDaysAgo
    ).length;

    const stats = {
      total_submissions: totalSubmissions,
      valid_submissions: statusCounts.owned || statusCounts.own || 0,
      duplicate_submissions: statusCounts.duplicate || 0,
      expired_submissions: statusCounts.expired || 0,
      hot_leads: statusCounts.hot_lead || 0,
      total_marketers: 1 // Marketer stats only show their own data
    };

    return NextResponse.json(stats);

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'TokenExpiredError: JWT token has expired' },
        { status: 403 }
      );
    }
    
    console.error('Error in stats endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
