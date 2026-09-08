'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboardPage from './dashboard/page';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // In a real application, you would have a more robust authentication check,
    // for example, by verifying a token from localStorage or a cookie.
    const loggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    if (!loggedIn) {
      router.replace('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    // You can show a loader here
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return <AdminDashboardPage />;
}