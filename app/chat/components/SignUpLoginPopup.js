import React, { useState } from "react";
import { motion } from "framer-motion";

const SignUpLoginPopup = ({ isOpen, closePopup, type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === "signup") {
      // Handle sign-up logic here
      console.log("Sign Up", { email, password, name });
    } else {
      // Handle login logic here
      console.log("Login", { email, password });
    }
  };

  return (
    isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
          <h2 className="text-center text-xl mb-4">{type === "signup" ? "Sign Up" : "Log In"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "signup" && (
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-6 rounded-lg"
              >
                {type === "signup" ? "Sign Up" : "Log In"}
              </button>
            </div>
          </form>
          <div className="text-center mt-4">
            <button
              onClick={closePopup}
              className="text-blue-500 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    )
  );
};

export default SignUpLoginPopup;