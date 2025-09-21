import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { getAuthPayloadFromCookie } from '@/lib/auth';

interface RouteContext {
  params: {
    userId: string;
  };
}

/**
 * GET /api/users/[userId]
 * Fetches the public profile of a specific user.
 *
 * This endpoint also determines if the currently authenticated user (the "viewer")
 * is following the user whose profile is being requested.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { userId: profileUserId } = params;

    // 1. Fetch the user profile, including their posts (with authors), followers, and following.
    const user = await prisma.user.findUnique({
      where: { id: profileUserId },
      include: {
        // Include posts and for each post, include the author's public info
        posts: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        // Include the list of followers
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              }
            }
          }
        },
        // Include the list of users this profile is following
        following: {
           select: {
            following: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              }
            }
          }
        }
      },
    });

    // Handle case where the user does not exist
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // 2. Check the follow status from the viewer's perspective
    let isFollowing = false;
    const authPayload = await getAuthPayloadFromCookie();
    const viewerId = authPayload?.userId;

    // Only perform this check if there is a logged-in viewer
    // and they are not viewing their own profile.
    if (viewerId && viewerId !== profileUserId) {
      const followRelationship = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: profileUserId,
          },
        },
        select: { id: true }, // Select a minimal field to check for existence
      });

      // If a record is found, the viewer is following the user.
      isFollowing = !!followRelationship;
    }

    // 3. Combine the profile data with the follow status and return
    // The 'following' array is now part of the 'user' object from Prisma,
    // so we don't need to manually add it.
    const userProfile = {
      ...user,
      isFollowing,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('GET_USER_PROFILE_ERROR', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}