// "use client";

// import { SignUp, useSession } from "@clerk/nextjs";

// const SignUpPage = () => {
//     const { session } = useSession();
//     return (
//         <div className="flex justify-center items-center">
//             <SignUp path="/sign-up" routing="path" signUpUrl="/sign-up"/>
//         </div>
//     );
// }

// export default SignUpPage;

"use client";

import { SignUp } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const hasCalled = useRef(false); // 👈 to prevent duplicate API calls

  useEffect(() => {
    const createUser = async () => {
      if (hasCalled.current) return;
      if (!isLoaded || !isSignedIn || !user) return;

      hasCalled.current = true; // ✅ block duplicates

      try {
        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            username: user.username || user.firstName || "user",
          }),
        });

        if (res.ok) {
          console.log("✅ User saved");
          router.push("/dashboard"); // or wherever
        } else {
          console.error("❌ Failed to save user:", await res.json());
        }
      } catch (err) {
        console.error("❌ API error:", err);
      }
    };

    createUser();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp path="/sign-up" routing="path" signUpUrl="/sign-up" />
    </div>
  );
};

export default SignUpPage;
