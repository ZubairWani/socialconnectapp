import { NextResponse, NextRequest } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 1. ADD THIS LINE to ensure the route runs in the Node.js runtime.
export const dynamic = 'force-dynamic';

/**
 * GET /api/feed
 * Fetches a personalized, paginated feed for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const authPayload =await getAuthPayloadFromCookie();
    
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authPayload;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const followingRelationships = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followedUserIds = followingRelationships.map(rel => rel.followingId);
    console.log("followedUserIds: ", followedUserIds)
    const authorIdsForFeed = [...followedUserIds, userId];

    const posts = await prisma.post.findMany({
      // 2. THE FIX IS HERE: The extra curly brace after `isActive: true,` has been removed.
      where: {
        authorId: { in: authorIdsForFeed },
        isActive: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        likes: {
          where: { userId: userId },
          select: { userId: true },
        },
      },
    });

    const feedPosts = posts.map(post => {
      const { likes, author, ...restOfPost } = post;
      return {
        ...restOfPost,
        author: {
          ...author,
          name: `${author.firstName} ${author.lastName}`,
        },
        isLiked: likes.length > 0,
      };
    });

    return NextResponse.json(feedPosts);

  } catch (error) {
    console.error('GET_FEED_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}