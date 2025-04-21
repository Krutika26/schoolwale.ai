// pages/api/create-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, email, username } = req.body; // No need for JSON.parse

  console.log("Incoming user:", { id, email, username });
  const prisma = new PrismaClient();

  try {
    // Check if the user already exists
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
      console.log("✅ User created in database.");
    } else {
      console.log("⚠️ User already exists.");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error adding user to database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
