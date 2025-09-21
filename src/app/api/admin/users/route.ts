// src/app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

/**
 * GET /api/admin/users
 * Fetches a paginated list of all users for the admin panel.
 * Protected route: Requires Admin role.
 */
export async function GET(request: Request) {
    try {
        const authPayload = await getAuthPayloadFromCookie();
        if (!authPayload || authPayload.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // You can add pagination later if needed: ?page=1&limit=20
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isActive: true,
                role: true,
                createdAt: true,
            },
        });

        // Format the data for the frontend table
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            status: user.isActive ? 'Active' : 'Deactivated',
            role: user.role,
            createdAt: format(new Date(user.createdAt), 'yyyy-MM-dd'),
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('ADMIN_GET_USERS_ERROR', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}