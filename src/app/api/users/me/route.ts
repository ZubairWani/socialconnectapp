import { NextResponse, NextRequest } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validators';

// THE FIX: This line is the solution.
// It forces the route to run in the Node.js runtime, which is required
// for database access and using the `cookies()` function.
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const authPayload = await getAuthPayloadFromCookie();

    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authPayload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        avatarUrl: true,
        website: true,
        location: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('GET_ME_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const authPayload = await getAuthPayloadFromCookie();

    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input.', errors: validation.error.flatten() }, { status: 400 });
    }

    const dataToUpdate = {
      ...validation.data,
      website: validation.data.website === '' ? null : validation.data.website,
    };

    const updatedUser = await prisma.user.update({
      where: { id: authPayload.userId },
      data: dataToUpdate, 
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        website: true,
        location: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('UPDATE_ME_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}