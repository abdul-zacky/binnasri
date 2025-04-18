import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth as adminAuth } from 'firebase-admin';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin if not already initialized
initAdmin();

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    // Create session cookie (expires in 5 days)
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn });
    
    // Set the cookie
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict'
    });
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  // Clear the session cookie
  cookies().delete('session');
  return NextResponse.json({ status: 'success' }, { status: 200 });
}