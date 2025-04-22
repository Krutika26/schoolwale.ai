"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
import { FaCircleInfo } from "react-icons/fa6";
import { useClerk } from '@clerk/clerk-react'; // Import Clerk hook

const Navbar = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const { signOut } = useClerk(); // Use Clerk's signOut function

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(); // This will sign the user out
      // Optionally redirect to a login or home page
      window.location.href = "/sign-in"; // or use a router for navigation
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!hasMounted) return null; // avoids mismatch

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-md flex items-center justify-between sticky top-0 z-50">
      {/* Left-side Info Icon */}
      <FaCircleInfo className="text-[#488184] text-3xl cursor-pointer" />

      {/* Right-side Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSignOut} // Trigger sign out when clicked
        className="bg-[#488184] flex items-center text-white px-4 py-2 rounded-md shadow hover:bg-[#3a686d] transition-all"
      >
        <FiLogOut className="mr-2" /> {/* Icon on the left side of the button */}
        Sign Out
      </motion.button>
    </nav>
  );
};

export default Navbar;