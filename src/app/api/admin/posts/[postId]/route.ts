// src/app/api/admin/posts/[postId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteContext {
    params: { postId: string };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
    try {
        const authPayload = await getAuthPayloadFromCookie();
        if (!authPayload || authPayload.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { postId } = params;

        await prisma.post.delete({
            where: { id: postId },
        });

        return new NextResponse(null, { status: 204 }); // Success, no content
    } catch (error) {
        console.error('ADMIN_DELETE_POST_ERROR', error);
        // Handle case where post to delete is not found
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}