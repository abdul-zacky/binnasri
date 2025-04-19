import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import admin from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Log initialization status
    console.log('Firebase Admin apps initialized:', admin.apps.length);
    
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }
    
    // Create session cookie (expires in 5 days)
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    
    // Set the cookie
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict'
    });
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Session creation error:', error);
    
    // Provide detailed error for debugging
    return NextResponse.json({ 
      error: 'Unauthorized',
      details: error.message, 
      code: error.code || 'unknown',
      appInitialized: admin.apps.length > 0
    }, { status: 401 });
  }
}

export async function DELETE() {
  // Clear the session cookie
  cookies().delete('session');
  return NextResponse.json({ status: 'success' }, { status: 200 });
}