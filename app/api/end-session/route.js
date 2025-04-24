import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const body = await req.json();
  const { userId, endedAt } = body;

  console.log("Ending session for:", userId, "at", endedAt);

  if (!userId || !endedAt) {
    return new Response(JSON.stringify({ error: "Missing userId or endedAt" }), { status: 400 });
  }

  try {
    // Find the latest (most recent) session for the user
    const latestSession = await prisma.chatSession.findFirst({
      where: { userId, endedAt: null },
      orderBy: { startedAt: "desc" },
    });

    if (!latestSession) {
      return new Response(JSON.stringify({ error: "No active session found to update" }), { status: 404 });
    }

    // Update that session's endedAt field
    await prisma.chatSession.update({
      where: { id: latestSession.id },
      data: { endedAt: endedAt },
    });

    console.log("Session ended:", latestSession.id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Error ending session:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}