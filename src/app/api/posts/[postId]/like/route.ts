
import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    postId: string;
  };
}

/**
 * POST /api/posts/[postId]/like
 * Likes a post for the current user and creates a notification for the author.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const authPayload = await getAuthPayloadFromCookie();
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const userId = authPayload.userId;

    const like = await prisma.$transaction(async (tx) => {
      // 1. Create the 'Like' record.
      const createdLike = await tx.like.create({
        data: {
          postId,
          userId,
        },
      });

      // 2. Update the post's likeCount and retrieve the author's ID.
      const post = await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
        select: { authorId: true },
      });

      // 3. Create a notification for the post's author,
      //    but only if they are not the one who liked the post.
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: 'Like',
            recipientId: post.authorId,
            senderId: userId,
            postId: postId,
          },
        });
      }

      // The transaction returns this single object.
      return createdLike;
    });

    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    console.error('LIKE_POST_ERROR', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ message: 'Post already liked.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[postId]/like
 * Unlikes a post for the current user.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const authPayload = await getAuthPayloadFromCookie();
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const userId = authPayload.userId;

    await prisma.$transaction([
      prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error('UNLIKE_POST_ERROR', error);
    // Handle cases where the record to delete doesn't exist gracefully
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Like not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}