import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/users/{userId}/following
 * Fetches a list of users the specified user is following.
 */
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;

    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      // Include the public profile of the user being followed
      select: {
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
       // Optional: Add pagination here
    });

    // Map the result to return a simple array of user profiles
    const followingProfiles = following.map(f => f.following);

    return NextResponse.json(followingProfiles);
  } catch (error) {
    console.error('GET_FOLLOWING_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}