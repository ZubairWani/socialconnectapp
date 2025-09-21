import { NextResponse } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';


export async function GET() {
    try {
        const authPayload = await getAuthPayloadFromCookie();

        if (!authPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const currentUserId = authPayload.userId;

        // Find IDs of users the current user is already following
        const following = await prisma.follow.findMany({
            where: { followerId: currentUserId },
            select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);

        // Find users who are not the current user and not already being followed
        const suggestions = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: currentUserId } }, // Exclude the current user
                    { id: { notIn: followingIds } }, // Exclude users already followed
                ],
            },
            take: 5, // Limit the number of suggestions
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatarUrl: true,
            },
        });

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('SUGGESTIONS_API_ERROR', error);
        return NextResponse.json(
            { message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}