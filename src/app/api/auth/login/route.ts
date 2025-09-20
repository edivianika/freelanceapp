import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Clean production code

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Debug: Log Supabase connection
    console.log('Login - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Login - Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Get user from custom users table
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email);

    console.log('Login - Query result:', { users, error });

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Debug: Log user data
    console.log('Login - User found:', { id: user.id, email: user.email, role: user.role });

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
