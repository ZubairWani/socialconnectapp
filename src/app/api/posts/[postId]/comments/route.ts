
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    postId: string;
  };
}


/**
 * GET /api/posts/[postId]/comments
 * Fetches all comments for a given post.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = params;
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' }, // Show newest comments first
      include: {
        author: {
          select: {
            id:true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
    
    // Format author name
    const formattedComments = comments.map(comment => ({
        ...comment,
        authorId: comment.author.id,
        author: {
            ...comment.author,
            name: `${comment.author.firstName} ${comment.author.lastName}`
        }
    }));

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error('GET_COMMENTS_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

// Zod schema for validating the request body
const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty.').max(280, 'Comment is too long.'),
});

/**
 * POST /api/posts/[postId]/comments
 * Creates a new comment on a post.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const authPayload = await getAuthPayloadFromCookie();
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const userId = authPayload.userId;

    const body = await req.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    const { content } = validation.data;

    const newComment = await prisma.$transaction(async (tx) => {
      // 1. Create the comment
      const comment = await tx.comment.create({
        data: {
          content,
          postId,
          authorId: userId,
        },
      });

      // 2. Update the post's comment count and get the author ID
      const post = await tx.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
        select: { authorId: true },
      });

      // 3. Create a notification for the post's author (if they aren't the commenter)
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: 'Comment',
            recipientId: post.authorId,
            senderId: userId,
            postId: postId,
          },
        });
      }

      return comment;
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('CREATE_COMMENT_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}


