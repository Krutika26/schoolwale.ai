"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiUser, FiCpu, FiCommand } from "react-icons/fi";
import { TbBulbFilled, TbTextGrammar } from "react-icons/tb";
import { FaBookOpen } from "react-icons/fa";
import { BiSolidPlanet } from "react-icons/bi";
import { IoMdCheckmark } from "react-icons/io";
import Navbar from "./components/Navbar";

const icons = [<TbBulbFilled className="text-[#edb949]"/>, <FaBookOpen className="text-[#76b2a4]"/>, <TbTextGrammar className="text-[#346a7e]"/>, <BiSolidPlanet className="text-[#76b2a4]"/>];
const colors = ['bg-[#fff7de]', 'bg-[#e9f5f1]', 'bg-[#c6e3dd]', 'bg-[#e9f5f1]'];

// Default chat options for quick start
const defaultOptions = [
    {
      title: "Your Maths Buddy",
      options: ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Statistics", "Calculus"],
    },
    {
      title: "Curriculum Based Q&A",
      options: ["All subjects", "ICSE", "CBSE", "International Board", "State Board"],
    },
    {
      title: "English Grammar Assistant",
      options: ["Essay writing", "Grammar checker", "Writing Improvement", "Detect"],
    },
    {
      title: "Science Explorer",
      options: ["Physics", "Space", "Astronomy", "Chemistry", "History/Geography"],
    },
  ];  

// Markdown component to render formatted text
const Markdown = ({ content }) => {
    // Process the content to handle special cases and formatting
    const processedContent = content
        .replace(/\\n/g, "\n")
        .replace(/\\\*/g, "*") // Unescape asterisks
        .replace(/\\"/g, '"') // Unescape quotation marks
        .replace(/##""##/g, "") // Remove ##""## artifacts
        .replace(/""\s*([^:]+):\*\*/g, '**"$1:"**') // Handle ""Text:** pattern
        .replace(/""([^"]+)""/g, '"$1"') // Handle double quotes
        .replace(/(\w+:)"/g, '$1"') // Fix quotes after colons
        .replace(/\*\*"([^"]+)"\*\*/g, '**"$1"**'); // Ensure quotes inside bold text

    return (
        <ReactMarkdown
            className="prose mt-1 w-full break-words prose-p:leading-relaxed py-3 px-3 mark-down"
            remarkPlugins={[remarkGfm]}
            components={{
                a: ({ node, ...props }) => (
                    <a
                        {...props}
                        style={{ color: "#27afcf", fontWeight: "bold" }}
                    />
                ),
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                        >
                            {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                // Add a custom paragraph renderer to preserve line breaks
                p: ({ children }) => (
                    <p className="whitespace-pre-line">{children}</p>
                ),
                strong: ({ children }) => (
                    <strong className="font-bold">{children}</strong>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-500 pl-4 py-2 my-2 italic bg-gray-800 rounded">
                        {children}
                    </blockquote>
                ),
            }}
        >
            {processedContent}
        </ReactMarkdown>
    );
};

// Main ChatStream component
const ChatStream = () => {
    // State variables for managing chat

    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [selectedSubOption, setSelectedSubOption] = useState("");
    const [userInput, setUserInput] = useState("");
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [chatStarted, setChatStarted] = useState(false);
    const chatContainerRef = useRef(null);

    // Scroll to bottom of chat when new messages are added
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        await startChat(question);
    };

    // Start or continue the chat
    const startChat = async (initialQuestion) => {
        // Update state and prepare for chat
        setChatStarted(true);
        setQuestion("");

        setMessages((prev) => [
            ...prev,
            { type: "user", content: initialQuestion },
            { type: "ai", content: "" },
        ]);

        console.log(initialQuestion)

        const curriculumOptions = defaultOptions.find(option => option.title === "Curriculum Based Q&A")?.options;

        if (curriculumOptions && curriculumOptions.some(sub => initialQuestion.toLowerCase().includes(sub.toLowerCase()))) {
            // Do something if initialQuestion contains one of the options
            console.log("Matched Curriculum Based Q&A");
            try {
                const response = await fetch("/api/pdfiles", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
            
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            
                // Parse the full JSON array
                const data = await response.json();
            
                // Extract and join all page contents
                const fullText = data.map((page) => page.pageContent).join(" ").trim();
            
                // Update your messages state
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
            
                    if (lastMessage?.type === "ai") {
                        lastMessage.content = (lastMessage.content + " " + fullText).trim();
                    } else {
                        // If there's no AI message yet, you can also choose to push one
                        newMessages.push({
                            type: "ai",
                            content: fullText,
                        });
                    }
            
                    return newMessages;
                });
            } catch (error) {
                console.error("Error fetching and processing PDF data:", error);
            }            
        }else{
            try {
                // Send request to chat API
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question: initialQuestion }),
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                // Handle the streaming response
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
    
                let lastWord = "";
    
                // Read the stream chunk by chunk
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
    
                    const chunk = decoder.decode(value);
                    const {
                        text,
                        lastWord: newLastWord,
                        isLast,
                    } = JSON.parse(chunk);
    
                    // Update messages with new content
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage.type === "ai") {
                            // Remove the last word if it's duplicated
                            const content = lastMessage.content.endsWith(lastWord)
                                ? lastMessage.content
                                      .slice(0, -lastWord.length)
                                      .trim()
                                : lastMessage.content;
    
                            lastMessage.content =
                                content + (content ? " " : "") + text;
                        }
                        return newMessages;
                    });
    
                    lastWord = newLastWord;
    
                    if (isLast) break;
                }
            } catch (error) {
                // Handle errors
                console.error("Error in chat:", error);
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "error",
                        content: "An error occurred while processing your request.",
                    },
                ]);
            }
        }
    };

    // Render the chat interface
    return (
        <div className="flex flex-col items-center min-h-screen bg-white text-gray-600">
            <Navbar/>
            <div className="w-full md:w-4/5 lg:w-3/5 flex flex-col h-screen">
                {/* Chat messages container */}
                <div
                    ref={chatContainerRef}
                    className="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar"
                >
                    <AnimatePresence>
                        {/* Map through messages and display them */}
                        {messages.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={`flex ${
                                    message.type === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className={`max-w-[80%] rounded-2xl shadow-lg ${
                                        message.type === "user"
                                            ? "bg-[#effaf8] p-4"
                                            : "bg-white p-4"
                                    } flex items-start`}
                                >
                                    <div className="mr-3 mt-1">
                                        {message.type === "user" ? (
                                            <FiUser className="text-xl" />
                                        ) : (
                                            <FiCpu className="text-xl" />
                                        )}
                                    </div>
                                    <div>
                                        {message.type === "user" ? (
                                            <p className="text-sm whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        ) : (
                                            <Markdown
                                                content={message.content}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                {/* Chat input form */}
                <form onSubmit={handleSubmit} className="flex items-center">
                    <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask anything here..."
                        className="flex-grow p-4 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#effaf8] border border-gray-200 shadow-inner"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="p-4 rounded-r-xl focus:outline-none focus:ring-2 transition-colors"
                    >
                        <FiSend className="text-xl" style={{ color: '#4a7f85' }} />
                    </motion.button>
                </form>
                {/* Chat input area */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Display default options if chat hasn't started */}
                    {!chatStarted && (
                        <div>
                            <h2 className="text-gray-600 text-center mb-4">
                                What else we can help you with. Select from below icon
                            </h2>
                            <div className="grid grid-cols-4 gap-10 mb-6">
                                {defaultOptions.map((optionGroup, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`h-auto min-h-60 w-56 p-4 ${colors[index]} text-gray-600 rounded-xl hover:brightness-110 transition-colors text-sm font-medium shadow-md flex flex-col justify-start text-center`}
                                    >
                                        <div className="text-3xl mb-2 flex justify-center">{icons[index]}</div>
                                        <div className="text-base font-semibold mb-3">{optionGroup.title}</div>

                                        {/* Sub-options */}
                                        <div className="flex flex-col items-start space-y-2 mt-2">
                                            {optionGroup.options.map((sub, subIndex) => (
                                                <button
                                                    key={subIndex}
                                                    onClick={() => {
                                                        setSelectedOptionIndex(index);
                                                        setSelectedSubOption(sub);
                                                        setUserInput("");
                                                    }}
                                                    className="flex items-center gap-2 text-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-200 text-left w-full"
                                                >
                                                    <IoMdCheckmark className="text-[#47735a]" />
                                                    <span>{sub}</span>
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {/* Input if this card is selected */}
                                        {selectedOptionIndex === index && selectedSubOption && (
                                            <div className="mt-4">
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 text-black rounded mb-2"
                                                    placeholder={`Enter ${selectedSubOption} query...`}
                                                    value={userInput}
                                                    onChange={(e) => setUserInput(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => startChat(`${selectedSubOption} ${userInput}`)}
                                                    className="mt-1 bg-black text-white px-3 py-1 rounded hover:bg-gray-800 text-xs"
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                        </div>
                    )}

                </motion.div>
            </div>
        </div>
    );
};

export default ChatStream;
