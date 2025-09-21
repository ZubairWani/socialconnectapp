import { NextResponse, NextRequest } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { postSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

/**
 * GET /api/posts
 * Fetches a paginated list of all posts. This route remains public.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { isActive: true },
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
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('LIST_POSTS_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}


/**
 * POST /api/posts
 * Creates a new post for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const authPayload =await getAuthPayloadFromCookie();
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = postSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input.', errors: validation.error.errors }, { status: 400 });
    }

    const { content, category, imageUrl } = body; 

    const newPost = await prisma.post.create({
      data: {
        content,
        category,
        imageUrl: imageUrl, 
        authorId: authPayload.userId,
      },
      include: {
        author: {
           select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        }
      }
    });

    await prisma.user.update({
        where: { id: authPayload.userId },
        data: { postsCount: { increment: 1 }}
    });
    
    const { author, ...restOfPost } = newPost;
    const postToReturn = {
      ...restOfPost,
      author: {
        ...author,
        name: `${author.firstName} ${author.lastName}`
      }
    };

    return NextResponse.json(postToReturn, { status: 201 });
  } catch (error) {
    console.error('CREATE_POST_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}