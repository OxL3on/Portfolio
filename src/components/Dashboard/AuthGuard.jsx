"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, signOut } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!auth) {
      fetch('/api/admin/auth')
        .then(res => {
          if (res.ok) {
            setAuthorized(true);
          } else {
            router.push('/login');
          }
        })
        .catch(() => router.push('/login'))
        .finally(() => setLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          const res = await fetch('/api/admin/auth');
          if (res.ok) {
            setAuthorized(true);
            setLoading(false);
            return;
          }
        } catch (e) {}
        router.push('/login');
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const verifyRes = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firebaseIdToken: idToken })
        });
        
        if (verifyRes.ok) {
          const data = await verifyRes.json();
          if (data.adminUser?.token) {
            localStorage.setItem("luffy_admin_session", data.adminUser.token);
          }
          setAuthorized(true);
        } else {
          await signOut(auth);
          router.push('/');
        }
      } catch (e) {
        console.error("Auth verification failed", e);
        router.push('/');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [router]);

  if (loading || !authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary shadow-[0_0_15px_rgba(var(--primary-color),0.5)]"></div>
        <p className="mt-4 text-foreground/70 font-semibold animate-pulse tracking-widest">VERIFYING ADMIN...</p>
      </div>
    );
  }

  return <>{children}</>;
}
