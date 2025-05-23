import { Mistral } from '@mistralai/mistralai';
import { PrismaClient } from "../../../lib/generated/prisma";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import EmojiConvertor from "emoji-js";

const prisma = new PrismaClient();
const mainChatMessageHistory = new ChatMessageHistory();

const emoji = new EmojiConvertor();
emoji.replace_mode = "unified";
emoji.allow_native = true;

export async function POST(req) {
  const body = await req.json();
  const { sender, session, question } = body;

  console.log(`Session: ${session.id}`);
  console.log(`Question: ${question}`);

  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    const client = new Mistral({ apiKey });

    await mainChatMessageHistory.addMessage(new HumanMessage(question));

    const formattedPrompt = `Please format your response using Markdown and include appropriate emoji shortcodes like :bulb:, :rocket:, etc. Start with a helpful greeting based on the time of day.

Question: ${question}`;

    const chatResponse = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: formattedPrompt }],
    });

    const fullResponse = chatResponse.choices[0].message.content;
    const withEmojis = emoji.replace_colons(fullResponse);

    console.log(`Final AI Response: ${withEmojis}`);

    await mainChatMessageHistory.addMessage(new AIMessage(withEmojis));

    const newMessagesJson = [
      { type: "human", text: question },
      { type: "ai", text: withEmojis },
    ];

    const existingSession = await prisma.chatSession.findUnique({
      where: { id: session.id },
      include: { messages: true },
    });

    if (existingSession) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: String(sender),
          messageJson: newMessagesJson,
        },
      });
    } else {
      await prisma.chatSession.create({
        data: {
          id: session.id,
          userId: sender,
          startedAt: session.createdAt,
          endedAt: session.expireAt,
        },
      });

      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: String(sender),
          messageJson: newMessagesJson,
        },
      });
    }

    return new Response(JSON.stringify({ text: withEmojis }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Fatal API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
