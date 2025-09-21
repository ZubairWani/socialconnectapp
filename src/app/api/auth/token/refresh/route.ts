import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, generateTokens } from '@/lib/auth';
import prisma from '@/lib/prisma';


export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token not found.' }, { status: 401 });
  }

  const payload = verifyToken(refreshToken);

  if (!payload) {
    // If refresh token is invalid, clear cookies to force re-login
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    return NextResponse.json({ message: 'Invalid refresh token.' }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
     return NextResponse.json({ message: 'User not found.' }, { status: 401 });
  }

  // Generate new tokens
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens({ id: user.id, role: user.role });

  // Set the new tokens in cookies
  cookieStore.set('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge:60 * 60 * 24 * 7,  // 7 days 
  });
   cookieStore.set('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });


  return NextResponse.json({ message: 'Token refreshed successfully.' });
}