import { NextResponse, NextRequest } from 'next/server';
import { getAuthPayload, getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { postSchema } from '@/lib/validators';

interface RouteContext {
  params: {
    postId: string;
  };
}


/**
 * GET /api/posts/[postId]
 * Fetches a single post by its ID.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = params;
    const authPayload = await getAuthPayloadFromCookie();
    const viewerId = authPayload?.userId;

    const post = await prisma.post.findUnique({
      where: { id: postId, isActive: true },
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
        // Conditionally include likes to check if the viewer has liked this post
        likes: viewerId ? { where: { userId: viewerId } } : false,
      },
    });

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    
    // Format the response to include the `isLiked` boolean
    const { likes, ...postData } = post;
    const responseData = {
      ...postData,
      isLiked: !!(likes && likes.length > 0),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(`GET_POST_ERROR`, error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * PATCH /api/posts/{postId}
 * Updates a post owned by the authenticated user.
 */
export async function PATCH(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const authPayload = getAuthPayload(request);
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== authPayload.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = postSchema.partial().safeParse(body); // .partial() allows updating only some fields

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input.', errors: validation.error.errors }, { status: 400 });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: validation.data,
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('UPDATE_POST_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/{postId}
 * Deletes a post owned by the authenticated user or an admin.
 */
export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const authPayload = await getAuthPayloadFromCookie();
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Allow deletion only if the user is the author OR an admin
    if (post.authorId !== authPayload.userId && authPayload.role !== 'Admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isActive: false },
    });

     // Decrement user's post count
    await prisma.user.update({
        where: { id: post.authorId },
        data: { postsCount: { decrement: 1 }}
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('DELETE_POST_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}