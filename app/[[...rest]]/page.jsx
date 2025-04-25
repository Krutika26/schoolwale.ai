'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  return (
    <main className="relative flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center bg-transparent text-white px-6 py-4">
        <div className="flex gap-4 items-center ml-auto">
          <Link href="/chat" className="hover:underline">Chat</Link>
          <button 
            className="px-4 py-2 rounded"
            onClick={() => router.push('/sign-in')}
          >
            Sign In
          </button>
          <button 
            className="px-4 py-2 rounded"
            onClick={() => router.push('/sign-up')}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <section className="relative flex-grow">
        <video 
          autoPlay 
          loop 
          muted 
          className="absolute inset-0 w-full h-[100vh] object-cover"
        >
          <source src="/159053-818026314_small.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 text-center text-white py-20">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our AI Educational Chatbot</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Our AI-powered educational chatbot is designed to assist students with personalized learning experiences.
            Whether you need help with specific subjects or simply want to explore new topics, our chatbot offers
            interactive Q&A, resources, and guidance on-demand.
          </p>
        </div>
      </section>
    </main>
  );
}
