// "use client";
// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { FiLogOut } from "react-icons/fi";
// import { useClerk } from '@clerk/clerk-react'; // Import Clerk hook
// import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa';

// const Navbar = () => {
//   const [hasMounted, setHasMounted] = useState(false);
//   const { signOut } = useClerk(); // Use Clerk's signOut function

//   useEffect(() => {
//     setHasMounted(true);
//   }, []);

//   const handleSignOut = async () => {
//     try {
//       await signOut(); // This will sign the user out
//       // Optionally redirect to a login or home page
//     } catch (error) {
//       console.error("Error signing out:", error);
//     }
//   };

//   if (!hasMounted) return null; // avoids mismatch

//   return (
//     <nav className="w-full px-6 py-4 bg-white shadow-md flex items-center justify-between sticky top-0 z-50">
//       <a
//         href="https://www.facebook.com"
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-600 hover:text-blue-800"
//       >
//         <FaFacebookF size={24} />
//       </a>

//       {/* Twitter */}
//       <a
//         href="https://www.twitter.com"
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-400 hover:text-blue-600"
//       >
//         <FaTwitter size={24} />
//       </a>

//       {/* Instagram */}
//       <a
//         href="https://www.instagram.com"
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-pink-600 hover:text-pink-800"
//       >
//         <FaInstagram size={24} />
//       </a>

//       {/* LinkedIn */}
//       <a
//         href="https://www.linkedin.com"
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-700 hover:text-blue-900"
//       >
//         <FaLinkedinIn size={24} />
//       </a>

//       {/* GitHub */}
//       <a
//         href="https://www.github.com"
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-gray-700 hover:text-gray-900"
//       >
//         <FaGithub size={24} />
//       </a>

//       {/* Right-side Button */}
//       <motion.button
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={handleSignOut} // Trigger sign out when clicked
//         className="bg-[#488184] flex items-center text-white px-4 py-2 rounded-md shadow hover:bg-[#3a686d] transition-all"
//       >
//         <FiLogOut className="mr-2" /> {/* Icon on the left side of the button */}
//         Sign Out
//       </motion.button>
//     </nav>
//   );
// };

// export default Navbar;

"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
import { useClerk } from '@clerk/clerk-react'; // Import Clerk hook
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa';

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
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!hasMounted) return null; // avoids mismatch

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-md flex items-center justify-between sticky top-0 z-50">
      {/* Left-side Social Media Icons */}
      <div className="flex space-x-4">
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <FaFacebookF size={20} />
        </a>

        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-pink-800"
        >
          <FaInstagram size={20} />
        </a>

        <a
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:text-blue-900"
        >
          <FaLinkedinIn size={20} />
        </a>
      </div>

      {/* Right-side Sign Out Button */}
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
