'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ChatStream = dynamic(() => import('../chat/page'));

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState('checking');

  useEffect(() => {
    if (!isLoaded || !userLoaded) return;

    if (isSignedIn && user) {
      const isNewUser = user.publicMetadata?.isNewUser === true;
      if (isNewUser) {
        router.replace('/sign-in'); // Redirect new users to sign-in
      } else {
        setAuthStatus('logged-in');
      }
    } else {
      router.replace('/sign-up'); // Redirect logged-out users to sign-up
    }
    console.log(authStatus)
  }, [isLoaded, isSignedIn, userLoaded, user, router]);

  if (authStatus === 'checking') {
    return <main className="flex min-h-screen items-center justify-center p-24">Loading...</main>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {authStatus === 'logged-in' && <ChatStream />}
    </main>
  );
}