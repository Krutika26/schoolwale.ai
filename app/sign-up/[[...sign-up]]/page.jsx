"use client";

import { SignUp } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const hasCreatedUser = useRef(false);

  useEffect(() => {
    console.log(isLoaded, user, isSignedIn, hasCreatedUser.current)
    if (!isLoaded) return; // 👈 wait for Clerk to be ready
    if (!isSignedIn || !user) return;
  
    hasCreatedUser.current = true;
  
    const createUser = async () => {
      try {
        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
            email: user.emailAddresses?.[0].emailAddress,
            username: user.username || user.firstName || "user",
          }),
        });

        console.log(res)
  
        if (res.ok) {
          console.log("User saved");
          router.push("/chat")
        } else {
          const err = await res.json();
          console.error("Save error:", err);
        }
      } catch (err) {
        console.error("API call failed:", err);
      }
    };
  
    createUser();
  }, [isLoaded, isSignedIn, user, router]);
  

  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp
        path="/sign-up"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/sign-up" // 👈 redirect to handle DB logic after signup
      />
    </div>
  );
}
