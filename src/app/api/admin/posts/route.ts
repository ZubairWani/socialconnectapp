// src/app/api/admin/posts/route.ts

import { NextResponse } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

/**
 * GET /api/admin/posts
 * Fetches a paginated list of all posts for the admin panel.
 * Protected route: Requires Admin role.
 */
export async function GET(request: Request) {
    try {
        const authPayload = await getAuthPayloadFromCookie();
        if (!authPayload || authPayload.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
        });

        // Format the data for the frontend table
        const formattedPosts = posts.map(post => ({
            id: post.id,
            authorName: `${post.author.firstName} ${post.author.lastName}`,
            authorUsername: post.author.username,
            content: post.content,
            category: post.category,
            createdAt: format(new Date(post.createdAt), 'yyyy-MM-dd'),
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error('ADMIN_GET_POSTS_ERROR', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}