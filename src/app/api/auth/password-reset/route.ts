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

    // Important: Do not reveal if a user exists or not for security reasons.
    // Always return a success message.
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

      // TODO: Send an email to the user with the reset link.
      // The link would look like: `https://your-app.com/password-reset-confirm?token=${resetToken}`
      // You must send the `resetToken` (unhashed) in the email, and store the `passwordResetToken` (hashed) in the DB.
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    return NextResponse.json({ message: 'If an account with this email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('PASSWORD_RESET_REQUEST_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}