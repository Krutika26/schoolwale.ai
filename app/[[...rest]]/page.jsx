'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getSessionTimes } from '../../lib/sessionTracker';

const ChatStream = dynamic(() => import('../chat/page'));

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState('checking');
  const [sessionTimes, setSessionTimes] = useState({ start: null, end: null });

  useEffect(() => {
    const times = getSessionTimes();
    console.log("Session started at:", times.start);
    console.log("Session ended at:", times.end);
    setSessionTimes(times);  // << save to state
  }, []);
  
  useEffect(() => {
    if (!isLoaded) return; // 👈 wait for Clerk to be ready
    if (!isSignedIn || !user) return;

    const createSession = async () => {
      if (!sessionTimes.start || !sessionTimes.end) {
        console.log("Session times are not ready yet.");
        return;
      }

      try {
        const res = await fetch("/api/end-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            endedAt: sessionTimes.end
          }),
        });

        if (res.ok) {
          console.log("Session saved");
          router.push("/sign-in");
        } else {
          const err = await res.json();
          console.error("Save error:", err);
        }
      } catch (err) {
        console.error("API call failed:", err);
      }
    };

    createSession();
  }, [sessionTimes]);  // << depends on sessionTimes

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const isNewUser = user.publicMetadata?.isNewUser === true;
      if (isNewUser) {
        router.replace('/sign-in'); 
      } else {
        setAuthStatus('logged-in');
      }
    } else {
      router.replace('/sign-up'); 
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (authStatus === 'checking') {
    return <main className="flex min-h-screen items-center justify-center p-24">Loading...</main>;
  }

  return (
    <main>
      {authStatus === 'logged-in' && <ChatStream />}
    </main>
  );
}