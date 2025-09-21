import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input.', errors: validation.error.errors }, { status: 400 });
    }

    const { email, username, password, first_name, last_name } = validation.data;

    // Check if user with the same email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email or username already exists.' },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName: first_name,
        lastName: last_name,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });
    
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}