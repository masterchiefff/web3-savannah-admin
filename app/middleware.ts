import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const response = await axios.get('http://localhost:5000/api/v1/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.user) {
      return NextResponse.next(); // Allow access
    }
  } catch (error) {
    // Token invalid or error
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/dashboard'], 
};