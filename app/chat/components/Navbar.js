"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaComments } from "react-icons/fa";
import SignUpLoginPopup from "./SignUpLoginPopup";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-md flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2 text-[#4a7f85] font-bold text-xl">
        <FaComments />
        <span>EduChat</span>
      </div>

      {/* Login/Signup Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleModal}
        className="bg-[#4a7f85] text-white px-4 py-2 rounded-md shadow hover:bg-[#3a686d] transition-all"
      >
        Login / Sign Up
      </motion.button>

      {/* Signup/Login Modal */}
      <SignUpLoginPopup isOpen={isModalOpen} onClose={handleToggleModal} />
    </nav>
  );
};

export default Navbar;