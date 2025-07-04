'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Helper function to verify token client-side
async function verifyToken(token: string) {
  try {
    const response = await axios.get('http://localhost:5000/api/v1/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  } catch (error) {
    return null;
  }
}

export default function Page() {
  const router = useRouter();
  const { user, login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.removeItem('lastPath'); 
      router.push('/login');
      return;
    }

    if (!user) {
      verifyToken(token).then((userData) => {
        if (!userData) {
          localStorage.removeItem('lastPath'); 
          router.push('/login');
        } else {
          login(token, userData); 
          localStorage.setItem('lastPath', window.location.pathname);
          router.push('/dashboard');
        }
      });
    } else {
      localStorage.setItem('lastPath', window.location.pathname);
      router.push('/dashboard');
    }
  }, [router, user, login]);

  return null;
}