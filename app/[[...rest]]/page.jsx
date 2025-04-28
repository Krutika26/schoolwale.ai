'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from '@clerk/nextjs';

export default function Home() {
  const router = useRouter();
  const { session, isLoaded } = useSession(); // Using Clerk to check session
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  // Function to handle "Chat" link click
  const handleChatClick = (e) => { // Remove the type annotation here
    e.preventDefault(); // Prevent the default redirect action
    if (!session) {
      setShowModal(true); // Show the modal if user is not signed in
    } else {
      router.push('/chat'); // Redirect to chat if user is signed in
    }
  };

  // Function to handle closing the modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Only show the content after session has loaded
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <main className="relative flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center bg-transparent text-white px-6 py-4">
        <div className="flex gap-4 items-center ml-auto">
          <Link href="/chat" onClick={handleChatClick} className="hover:underline">
            Chat
          </Link>
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

      {/* Modal for Sign In/Sign Up */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Please Sign In or Sign Up</h2>
            <p className="mb-4">
              You need to sign in or sign up to access the chat. Choose an option below:
            </p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => {
                  router.push('/sign-in');
                  closeModal();
                }}
              >
                Sign In
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={() => {
                  router.push('/sign-up');
                  closeModal();
                }}
              >
                Sign Up
              </button>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={closeModal}
            >
              X
            </button>
          </div>
        </div>
      )}
    </main>
  );
}