"use client";

import React, { useState, useEffect } from "react";

const ChatHistory = () => {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chathistory');
      console.log(response)
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(date).toLocaleString(undefined, options);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Chat History</h1>

      {/* Display messages */}
      {messages.map((msg) => (
        <div key={msg.id}>
          <p>{msg.messageText}</p>
          <small>{formatDate(msg.sentAt)}</small>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;