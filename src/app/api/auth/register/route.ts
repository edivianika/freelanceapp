import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, role = 'marketer' } = await request.json();

    console.log('🔍 Register - Request data:', { name, email, phone, role });

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists in custom users table
    const { data: existingUsers, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email);

    console.log('🔍 Register - Existing user check:', { existingUsers, existingUserError });

    if (existingUserError) {
      console.error('Error checking existing user:', existingUserError);
      return NextResponse.json({ error: existingUserError.message }, { status: 500 });
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user profile in custom users table
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        phone: phone || null,
        password_hash: hashedPassword,
        role
      })
      .select('id, name, email, phone, role, created_at, updated_at')
      .single();

    console.log('🔍 Register - User creation result:', { user, error });

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
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

    console.log('🔍 Register - Success:', { id: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
