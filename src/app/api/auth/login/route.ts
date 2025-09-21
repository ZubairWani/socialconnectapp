import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateTokens } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input.', errors: validation.error }, { status: 400 });
    }

    const { identifier, password } = validation.data;

    // Find the user by either email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    // Verify the password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    // TODO: Check if email is verified if you have an email verification flow
    // if (!user.emailVerified) {
    //   return NextResponse.json({ message: 'Please verify your email before logging in.' }, { status: 403 });
    // }

    // Update last login timestamp
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });

    // Generate JWT access and refresh tokens
    const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role });

    // Set tokens in secure, HTTP-only cookies
    const cookieStore =await cookies();
    cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 15 minutes
    });
    cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // For security, don't return the password in the response
    const { password: _, ...userProfile } = user;

    return NextResponse.json({ user: userProfile });

  } catch (error) {
    console.error('LOGIN_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}