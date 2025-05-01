"use client";

import React, { useState, useEffect, useRef } from "react";
import GroupedMessagesAll from "./GroupedmessagesToday"

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

  const checkForTruncation = () => {
    const truncated = [];
    messageRefs.current.forEach((ref, index) => {
      if (ref && ref.scrollWidth > ref.clientWidth) {
        truncated.push(index);
      }
    });
    setTruncatedMessages(truncated);
  };

  useEffect(() => {
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
        const options = { year: 'numeric', month: 'long' };
        const monthYear = sentAt.toLocaleDateString('en-US', options);
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
      <GroupedMessagesAll groupedMessages={groupedMessages} />
    </div>
  );
};

export default ChatHistory;