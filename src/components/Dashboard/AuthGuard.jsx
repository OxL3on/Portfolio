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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/maininfo');
        const data = await res.json();
        const adminEmail = data?.gmail || "leonislamofficial123@gmail.com";
        
        if (user.email === adminEmail) {
          setAuthorized(true);
        } else {
          // Email mismatch! Not the admin.
          await signOut(auth);
          alert("Unauthorized access. Only admin can login here.");
          router.push('/');
        }
      } catch (e) {
        console.error("Auth verification failed", e);
        router.push('/');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
