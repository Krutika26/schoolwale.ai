"use client";

import { SignIn, useSession } from "@clerk/nextjs";

const SignInPage = () => {
    const { session } = useSession();
    console.log(session);
    return (
        <div className="flex justify-center items-center h-screen">
            <SignIn path="/sign-in" routing="path" signInUrl="/sign-in" />
        </div>
    );
}

export default SignInPage;