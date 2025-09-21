import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate a secure, random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set an expiration date (e.g., 10 minutes from now)
      const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.user.update({
        where: { email },
        data: {
          passwordResetToken,
          passwordResetExpires,
        },
      });
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    return NextResponse.json({ message: 'If an account with this email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('PASSWORD_RESET_REQUEST_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}