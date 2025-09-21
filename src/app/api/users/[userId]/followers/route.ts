import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/users/{userId}/followers
 * Fetches a list of users who are following the specified user.
 */
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;

    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      // Include the public profile of the follower
      select: {
        follower: {
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
      // take: 20,
      // skip: 0,
    });

    // Map the result to return a simple array of user profiles
    const followerProfiles = followers.map(f => f.follower);

    return NextResponse.json(followerProfiles);
  } catch (error) {
    console.error('GET_FOLLOWERS_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}