import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { refresh_token } = await request.json();

        if (!refresh_token) {
            return NextResponse.json(
                { error: 'Missing refresh token' },
                { status: 400 }
            );
        }

        const response = NextResponse.json({ success: true });

        response.cookies.set('refresh_token', refresh_token, {
            httpOnly: true,                              
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',                            
            maxAge: 60 * 60 * 24 * 7,              
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Set cookie error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}