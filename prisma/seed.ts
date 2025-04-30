import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      username: 'john_doe',
      email: 'john.doe@example.com',
    },
  });

  console.log('User created:', user);

  // Create a chat session for the user
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: user.id, // Associate session with the created user
      startedAt: new Date(),
    },
  });

  console.log('Chat session created:', chatSession);

  // Create chat messages for the session
  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: chatSession.id,
        sender: 'user',
        messageJson: JSON.stringify({ text: 'Hello, how are you?' }),
        sentAt: new Date(),
      },
      {
        sessionId: chatSession.id,
        sender: 'bot',
        messageJson: JSON.stringify({ text: 'I am doing great, thank you!' }),
        sentAt: new Date(),
      },
      {
        sessionId: chatSession.id,
        sender: 'user',
        messageJson: JSON.stringify({ text: 'What can you do for me?' }),
        sentAt: new Date(),
      },
      {
        sessionId: chatSession.id,
        sender: 'bot',
        messageJson: JSON.stringify({ text: 'I can assist you with various tasks!' }),
        sentAt: new Date(),
      },
    ],
  });

  console.log('Chat messages created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
