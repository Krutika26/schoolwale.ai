import { Ollama } from "@langchain/ollama";
import { PrismaClient } from "../../../lib/generated/prisma";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const prisma = new PrismaClient();
const mainChatMessageHistory = new ChatMessageHistory();

export async function POST(req) {
    const body = await req.json();
    const { sender, session, question } = body;

    console.log(`Session: ${session.id}`);
    console.log(`Question: ${question}`);

    try {
        const model = new Ollama({
            model: "codeqwen",
            baseUrl: "http://127.0.0.1:11434",
            stream: true,
        });

        await mainChatMessageHistory.addMessage(new HumanMessage(question));

        let fullResponse = "";
        let buffer = "";

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of await model.stream(question)) {
                        fullResponse += chunk;
                        buffer += chunk;

                        const words = buffer.split(/\s+/);
                        if (words.length >= 15) {
                            const completeWords = words.slice(0, -1).join(" ");
                            controller.enqueue(
                                new TextEncoder().encode(
                                    JSON.stringify({ text: completeWords })
                                )
                            );
                            buffer = words[words.length - 1];
                        }
                    }

                    // Handle any remaining content
                    if (buffer) {
                        controller.enqueue(
                            new TextEncoder().encode(
                                JSON.stringify({ text: buffer, isLast: true })
                            )
                        );
                    }

                    controller.close();

                    // ✅ Post-stream logic: log and store full response
                    console.log(`Full AI Response: ${fullResponse}`);

                    await mainChatMessageHistory.addMessage(new AIMessage(fullResponse));

                    const newMessagesJson = [
                        { type: "human", text: question },
                        { type: "ai", text: fullResponse },
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
                } catch (error) {
                    console.error("Error during streaming or DB write:", error);
                    controller.error(error);
                }
            },
        });

        // Pass the stream to the frontend
        const reader = stream.getReader();
        const streamBody = new ReadableStream({
            start(controller) {
                const push = () => {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        controller.enqueue(value);
                        push(); // continue reading
                    }).catch(err => {
                        console.error("Stream reading error:", err);
                        controller.error(err);
                    });
                };
                push();
            },
        });

        // Return the streamed response to the client
        return new Response(streamBody, {
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