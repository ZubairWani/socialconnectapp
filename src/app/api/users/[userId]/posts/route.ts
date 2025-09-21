import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthPayloadFromCookie } from '@/lib/auth';

// This is a dynamic route, so we ensure it runs in the Node.js runtime.
export const dynamic = 'force-dynamic';

/**
 * GET /api/users/{userId}/posts
 * Fetches a paginated list of posts for a specific user.
 */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId: targetUserId } = params;
    
    // We get the current user to determine if they've liked the posts in the list.
    const authPayload =await getAuthPayloadFromCookie();
    const currentUserId = authPayload?.userId;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: {
        authorId: targetUserId,
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
          where: { userId: currentUserId }, // Only include the current user's like
          select: { userId: true },
        },
      },
    });

    // Format the data to be frontend-friendly, just like in the feed API
    const userPosts = posts.map(post => {
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

    return NextResponse.json(userPosts);

  } catch (error) {
    console.error(`GET_USER_POSTS_ERROR for user ${params.userId}:`, error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}