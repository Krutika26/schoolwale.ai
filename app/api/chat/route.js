// // Import necessary libraries and components

// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ChatMessageHistory } from "langchain/stores/message/in_memory";
// import { HumanMessage, AIMessage } from "@langchain/core/messages";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { Ollama } from "@langchain/ollama";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// // Create a chat history to store messages
// const mainChatMessageHistory = new ChatMessageHistory();

// // Define the main function that handles POST requests

// export async function POST(req) {
//     const body = await req.json();
//     const { sender, session, question} = body;
//     console.log(session)
//     try {
//         // Set up the AI model (Ollama) with specific configurations
//         const model = new Ollama({
//             model: "codeqwen",
//             baseUrl: "http://127.0.0.1:11434",
//             stream: true,
//         });
//         console.log(question)

//         // Add the user's question to the chat history
//         await mainChatMessageHistory.addMessage(new HumanMessage(question));
//         // Create a stream to handle the AI's response
//         const stream = new ReadableStream({
//             async start(controller) {
//                 let fullResponse = "";
//                 let buffer = "";
//                 let lastWord = "";
//                 // Process the AI's response in chunks

//                 for await (const chunk of await model.stream(question)) {
//                     fullResponse += chunk;
//                     buffer += chunk;
//                     // Split the buffer into words
//                     console.log(chunk);
//                     const words = buffer.split(/\s+/);
//                     // If we have 15 or more words, send them to the client
//                     if (words.length >= 15) {
//                         const completeWords = words.slice(0, -1).join(" ");
//                         controller.enqueue(
//                             new TextEncoder().encode(
//                                 JSON.stringify({
//                                     text: completeWords,
//                                     lastWord: lastWord,
//                                 })
//                             )
//                         );
//                         // Keep the last word in the buffer

//                         buffer = words[words.length - 1];
//                         lastWord = completeWords.split(/\s+/).pop();
//                     }
//                 }
//                 // Send any remaining content

//                 if (buffer) {
//                     controller.enqueue(
//                         new TextEncoder().encode(
//                             JSON.stringify({
//                                 text: buffer,
//                                 lastWord: lastWord,
//                                 isLast: true,
//                             })
//                         )
//                     );
//                 }
//                 // Add the AI's full response to the chat history
//                 await mainChatMessageHistory.addMessage(
//                     new AIMessage(fullResponse)
//                 );
//                 controller.close();
//             },
//         });
//         //convert chat istory to text
//         const chatHistoryString = mainChatMessageHistory.messages
//             .map((message) => message.text)
//             .join("\n");
//         //add chat to prisma db
//         await prisma.chatSession.create({
//             data: {
//               id: session.id,
//               userId: sender,
//               startedAt: session.createdAt,
//               endedAt: session.expireAt
//             },
//           });
//         await prisma.chatMessage.create({
//             data: {
//                 sessionId: session.id, // Ensure sessionId is a string
//                 sender: String(sender),
//                 messageText: chatHistoryString,
//             } 
//          })
//         // Return the stream as the response
//         return new Response(stream, {
//             headers: { "Content-Type": "application/json" },
//         });
//     } catch (error) {
//         // Handle any errors and return an error response

//         console.error(error);
//         return new Response(JSON.stringify({ error: error.message }), {
//             status: 500,
//             headers: { "Content-Type": "application/json" },
//         });
//     }
// }

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/ollama";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Create a chat history to store messages
const mainChatMessageHistory = new ChatMessageHistory();

// Define the main function that handles POST requests
export async function POST(req) {
    const body = await req.json();
    const { sender, session, question } = body;
    console.log(session);
    try {
        // Set up the AI model (Ollama) with specific configurations
        const model = new Ollama({
            model: "codeqwen",
            baseUrl: "http://127.0.0.1:11434",
            stream: true,
        });
        console.log(question);

        // Add the user's question to the chat history
        await mainChatMessageHistory.addMessage(new HumanMessage(question));
        // Create a stream to handle the AI's response
        const stream = new ReadableStream({
            async start(controller) {
                let fullResponse = "";
                let buffer = "";
                let lastWord = "";
                // Process the AI's response in chunks

                for await (const chunk of await model.stream(question)) {
                    fullResponse += chunk;
                    buffer += chunk;
                    // Split the buffer into words
                    console.log(chunk);
                    const words = buffer.split(/\s+/);
                    // If we have 15 or more words, send them to the client
                    if (words.length >= 15) {
                        const completeWords = words.slice(0, -1).join(" ");
                        controller.enqueue(
                            new TextEncoder().encode(
                                JSON.stringify({
                                    text: completeWords,
                                    lastWord: lastWord,
                                })
                            )
                        );
                        // Keep the last word in the buffer

                        buffer = words[words.length - 1];
                        lastWord = completeWords.split(/\s+/).pop();
                    }
                }
                // Send any remaining content

                if (buffer) {
                    controller.enqueue(
                        new TextEncoder().encode(
                            JSON.stringify({
                                text: buffer,
                                lastWord: lastWord,
                                isLast: true,
                            })
                        )
                    );
                }
                // Add the AI's full response to the chat history
                await mainChatMessageHistory.addMessage(
                    new AIMessage(fullResponse)
                );
                controller.close();
            },
        });
        // Convert chat history to text
        const chatHistoryString = mainChatMessageHistory.messages
            .map((message) => message.text)
            .join("\n");

        // Check if the session exists
        const existingSession = await prisma.chatSession.findUnique({
            where: { id: session.id },
            include: { messages: true }, // Include related messages in the query
        });

        if (existingSession) {
            // Create a new ChatMessage for the current message
            await prisma.chatMessage.create({
                data: {
                    sessionId: session.id, // Ensure sessionId is a string
                    sender: String(sender),
                    messageText: chatHistoryString,
                },
            });
        } else {
            // If the session doesn't exist, create a new session
            await prisma.chatSession.create({
                data: {
                    id: session.id,
                    userId: sender,
                    startedAt: session.createdAt,
                    endedAt: session.expireAt,
                },
            });
            // Create a new ChatMessage for the first message
            await prisma.chatMessage.create({
                data: {
                    sessionId: session.id, // Ensure sessionId is a string
                    sender: String(sender),
                    messageText: chatHistoryString,
                },
            });
        }

        // Return the stream as the response
        return new Response(stream, {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        // Handle any errors and return an error response
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
