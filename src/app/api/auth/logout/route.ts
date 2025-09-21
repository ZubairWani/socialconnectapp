import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        // A robust implementation would add the refresh token to a blacklist in the DB
        // to prevent it from being used again before it expires.
        // For example:
        // const refreshToken = cookies().get('refreshToken')?.value;
        // if (refreshToken) {
        //   await prisma.blacklistedToken.create({ data: { token: refreshToken }});
        // }

        const cookieStore = cookies();
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');

        return NextResponse.json({ message: 'Logged out successfully.' }, { status: 200 });

    } catch (error) {
        console.error('LOGOUT_ERROR', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}