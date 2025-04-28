"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiMessageCircle } from 'react-icons/fi';

const ChatHistory = () => {
  const [messages, setMessages] = useState([]);
  const [truncatedMessages, setTruncatedMessages] = useState([]);

  const messageRefs = useRef([]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/chathistory");
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Check if the message overflows and is truncated
  const checkForTruncation = () => {
    const truncated = [];
    messageRefs.current.forEach((ref, index) => {
      if (ref && ref.scrollWidth > ref.clientWidth) {
        truncated.push(index); // If message is truncated, store its index
      }
    });
    setTruncatedMessages(truncated);
  };

  useEffect(() => {
    // After the component mounts and messages are set, check for truncation
    checkForTruncation();
  }, [messages]);

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(date).toLocaleString(undefined, options);
  };

  const groupMessagesByDate = (messages) => {
    const today = new Date();
    const groupedMessages = {
      today: [],
      yesterday: [],
      last7Days: [],
      last30Days: [],
      previousMonths: {},
    };

    messages.forEach((msg) => {
      const sentAt = new Date(msg.sentAt);
      const diffInDays = Math.floor((today - sentAt) / (1000 * 3600 * 24));

      if (diffInDays === 0) {
        groupedMessages.today.push(msg);
      } else if (diffInDays === 1) {
        groupedMessages.yesterday.push(msg);
      } else if (diffInDays <= 7) {
        groupedMessages.last7Days.push(msg);
      } else if (diffInDays <= 30) {
        groupedMessages.last30Days.push(msg);
      } else {
        // const monthYear = `${sentAt.getFullYear()}-${sentAt.getMonth() + 1}`;
        const options = { year: 'numeric', month: 'long' };
        const monthYear = sentAt.toLocaleDateString('en-US', options); // e.g., "January 2025"

        if (!groupedMessages.previousMonths[monthYear]) {
          groupedMessages.previousMonths[monthYear] = [];
        }
        groupedMessages.previousMonths[monthYear].push(msg);
      }
    });

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="mb-20">
      <h1 className="text-lg font-semibold text-center">Chat History</h1>

      {/* Display Today messages */}
      {groupedMessages.today.length > 0 && (
        <div>
          <h2 className="text-md font-semibold">Today</h2>
          {groupedMessages.today.map((msg, index) => (
            <div
              key={msg.id}
              className={`message-container flex items-center gap-2 my-1 ${truncatedMessages.includes(index) ? 'truncated' : ''}`}
              ref={(el) => (messageRefs.current[index] = el)}
            >
              <span>{msg.messageText}</span>
            </div>
          ))}
        </div>
      )}

      {/* Display Yesterday messages */}
      {groupedMessages.yesterday.length > 0 && (
        <div>
          <h2 className="text-md font-semibold">Yesterday</h2>
          {groupedMessages.yesterday.map((msg, index) => (
            <div
              key={msg.id}
              className={`message-container flex items-center gap-2 my-1 ${truncatedMessages.includes(index) ? 'truncated' : ''}`}
              ref={(el) => (messageRefs.current[index] = el)}
            >
              <p>{msg.messageText}</p>
            </div>
          ))}
        </div>
      )}

      {/* Display Last 7 Days messages */}
      {groupedMessages.last7Days.length > 0 && (
        <div>
          <h2 className="text-md font-semibold">Last 7 Days</h2>
          {groupedMessages.last7Days.map((msg, index) => (
            <div
              key={msg.id}
              className={`message-container flex items-center gap-2 my-1 ${truncatedMessages.includes(index) ? 'truncated' : ''}`}
              ref={(el) => (messageRefs.current[index] = el)}
            >
              <p>{msg.messageText}</p>
            </div>
          ))}
        </div>
      )}

      {/* Display Last 30 Days messages */}
      {groupedMessages.last30Days.length > 0 && (
        <div>
          <h2 className="text-md font-semibold">Last 30 Days</h2>
          {groupedMessages.last30Days.map((msg, index) => (
            <div
              key={msg.id}
              className={`message-container flex items-center gap-2 my-1 ${truncatedMessages.includes(index) ? 'truncated' : ''}`}
              ref={(el) => (messageRefs.current[index] = el)}
            >
              <p>{msg.messageText}</p>
            </div>
          ))}
        </div>
      )}

      {/* Display Previous Months */}
      {Object.keys(groupedMessages.previousMonths).map((monthYear) => (
        <div key={monthYear}>
          <h2 className="text-md font-semibold">{monthYear}</h2>
          {groupedMessages.previousMonths[monthYear].map((msg, index) => (
            <div
              key={msg.id}
              className={`message-container flex items-center gap-2 my-1 ${truncatedMessages.includes(index) ? 'truncated' : ''}`}
              ref={(el) => (messageRefs.current[index] = el)}
            >
              <p>{msg.messageText}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
