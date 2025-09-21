import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteContext {
    params: {
        postId: string;
        commentId: string;
    };
}

/**
 * DELETE /api/posts/[postId]/comments/[commentId]
 * Deletes a specific comment.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
    try {
        const authPayload = await getAuthPayloadFromCookie();
        if (!authPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { postId, commentId } = params;
        const currentUserId = authPayload.userId;

        await prisma.$transaction(async (tx) => {
            // 1. Find the comment to verify ownership
            const comment = await tx.comment.findUnique({
                where: { id: commentId },
                select: { authorId: true },
            });

            if (!comment) {
                throw new Error('Comment not found.'); // This will be caught and returned as 404
            }

            // 2. Security Check: Ensure the user owns the comment
            if (comment.authorId !== currentUserId) {
                throw new Error('Forbidden'); // This will be caught and returned as 403
            }

            // 3. Delete the comment
            await tx.comment.delete({
                where: { id: commentId },
            });

            // 4. Decrement the post's comment count
            await tx.post.update({
                where: { id: postId },
                data: { commentCount: { decrement: 1 } },
            });
        });

        return new NextResponse(null, { status: 204 }); // Success, no content
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Comment not found.') {
                return NextResponse.json({ message: error.message }, { status: 404 });
            }
            if (error.message === 'Forbidden') {
                return NextResponse.json({ message: 'You are not authorized to delete this comment.' }, { status: 403 });
            }
        }
        console.error('DELETE_COMMENT_ERROR', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}