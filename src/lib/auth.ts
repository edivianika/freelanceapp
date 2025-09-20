import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';
import { User, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): unknown {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function createUser(userData: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
}): Promise<User> {
  const hashedPassword = await hashPassword(userData.password);
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password_hash: hashedPassword,
      role: userData.role || 'marketer'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    return null;
  }

  // Remove password_hash from returned user
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  const { password_hash, ...userWithoutPassword } = data;
  return userWithoutPassword as User;
}


