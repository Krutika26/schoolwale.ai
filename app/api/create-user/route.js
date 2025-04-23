import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const body = await req.json();
  const { id, email, username } = body;

  console.log("Incoming user:", { id, email, username });

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          id,
          email,
          username,
        },
      });
      console.log("User created in database.");
    } else {
      console.log("User already exists.");
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error adding user to database:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}