"use client";

import { AdminDashboard } from '@/components/admin-dashboard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token
    verifyToken(token).then((userData) => {
      if (!userData) {
        router.push('/login');
      } else {
        setUser(userData);
      }
    });
  }, [router]);

  if (!user) {
    return null; 
  }

  return <AdminDashboard />;
}