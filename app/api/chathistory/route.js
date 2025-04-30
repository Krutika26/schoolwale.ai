import { PrismaClient } from "../../../lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    const previousMonths = [];
    for (let i = 1; i <= 3; i++) { // Adjust number of previous months as needed
      const previousMonth = new Date(today);
      previousMonth.setMonth(today.getMonth() - i);
      previousMonth.setDate(1); // Get the start of the month
      previousMonths.push(previousMonth);
    }

    // Fetch all messages (remove the date filter)
    const messages = await prisma.chatMessage.findMany();

    return new Response(JSON.stringify({ messages }), { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new Response('Error fetching messages', { status: 500 });
  }
}
