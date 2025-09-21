import { NextResponse } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfDay } from 'date-fns';

/**
 * GET /api/admin/stats
 * Fetches key statistics for the admin dashboard.
 * This is a protected route and requires the user to have an 'Admin' role.
 */
export async function GET() {
    try {
        // 1. Security: Ensure the user is an authenticated Admin
        const authPayload = await getAuthPayloadFromCookie();
        console.log("ap: ", authPayload)
        if (!authPayload || authPayload.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch all stats in a single, parallel database transaction
        const [totalUsers, totalPosts, activeToday] = await prisma.$transaction([
            // Query 1: Get the total number of users
            prisma.user.count(),

            // Query 2: Get the total number of posts
            prisma.post.count(),

            // Query 3: Get users who have logged in since the start of today
            prisma.user.count({
                where: {
                    lastLogin: {
                        gte: startOfDay(new Date()), // 'gte' means "greater than or equal to"
                    },
                },
            }),
        ]);

        // 3. Return the stats in a JSON response
        return NextResponse.json({
            totalUsers,
            totalPosts,
            activeToday,
        });

    } catch (error) {
        console.error('ADMIN_STATS_API_ERROR', error);
        return NextResponse.json(
            { message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}