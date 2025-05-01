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
import { ChevronLeft, ChevronRight } from 'lucide-react'; // optional icons
import DocumentUpload from "./components/DocumentUpload";
import { useUser, useSession } from "@clerk/nextjs";
import ChatHistory  from "./components/ChatHistory"
import dynamic from "next/dynamic";
import { CiMicrophoneOn , CiMicrophoneOff } from "react-icons/ci";
import EmojiConvertor from "emoji-js"; // 👈 Add emoji-js


const emoji = new EmojiConvertor();
emoji.replace_mode = "unified";
emoji.allow_native = true;

const icons = [<TbBulbFilled className="text-[#edb949]"/>, <FaBookOpen className="text-[#76b2a4]"/>, <TbTextGrammar className="text-[#346a7e]"/>, <BiSolidPlanet className="text-[#76b2a4]"/>];
const colors = ['bg-[#fff7de]', 'bg-[#e9f5f1]', 'bg-[#c6e3dd]', 'bg-[#e9f5f1]'];
const Navbar = dynamic(() => import("./components/Navbar"), { ssr: false });

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

const uploadOptions = [
    {
        title: "Explain data"
    },
    {
        title: "Summarize data"
    },
    {
        title: "Analyze data"
    }
]

const uploadOptions2 = [
    {
        title: "Solve the Attached",
        bgColor: "bg-[#468081]",
        hoverColor: "hover:bg-[#468081]-600"
    },
    {
        title: "Verify My Answer",
        bgColor: "bg-[#eb9b80]",
        hoverColor: "hover:bg-[#eb9b80]-600"
    }
];  

const classOptions = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

const subjectOptions = [
  "Mathematics",
  "Science",
  "English",
  "Social Science",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Economics",
  "Civics",
  "Environmental Studies",
  "Hindi",
  "Sanskrit",
  "General Knowledge"
];

const boardBasedOptions = ["All subjects", "ICSE", "CBSE", "International Board", "State Board"];

// Markdown component to render formatted text
// const Markdown = ({ content }) => {
//     // Process the content to handle special cases and formatting
//     console.log(content);
//     const processedContent = content
//         .replace(/\\n/g, "\n")
//         .replace(/\\\*/g, "*") // Unescape asterisks
//         .replace(/\\"/g, '"') // Unescape quotation marks
//         .replace(/##""##/g, "") // Remove ##""## artifacts
//         .replace(/""\s*([^:]+):\*\*/g, '**"$1:"**') // Handle ""Text:** pattern
//         .replace(/""([^"]+)""/g, '"$1"') // Handle double quotes
//         .replace(/(\w+:)"/g, '$1"') // Fix quotes after colons
//         .replace(/\*\*"([^"]+)"\*\*/g, '**"$1"**'); // Ensure quotes inside bold text

//     return (
//         <ReactMarkdown
//             className="prose mt-1 w-full break-words prose-p:leading-relaxed py-3 px-3 mark-down"
//             remarkPlugins={[remarkGfm]}
//             components={{
//                 a: ({ node, ...props }) => (
//                     <a
//                         {...props}
//                         style={{ color: "#27afcf", fontWeight: "bold" }}
//                     />
//                 ),
//                 code({ node, inline, className, children, ...props }) {
//                     const match = /language-(\w+)/.exec(className || "");
//                     return !inline && match ? (
//                         <SyntaxHighlighter
//                             style={vscDarkPlus}
//                             language={match[1]}
//                             PreTag="div"
//                             {...props}
//                         >
//                             {String(children).replace(/\n$/, "")}
//                         </SyntaxHighlighter>
//                     ) : (
//                         <code className={className} {...props}>
//                             {children}
//                         </code>
//                     );
//                 },
//                 // Add a custom paragraph renderer to preserve line breaks
//                 p: ({ children }) => (
//                     <p className="whitespace-pre-line">{children}</p>
//                 ),
//                 strong: ({ children }) => (
//                     <strong className="font-bold">{children}</strong>
//                 ),
//                 blockquote: ({ children }) => (
//                     <blockquote className="border-l-4 border-gray-500 pl-4 py-2 my-2 italic bg-gray-800 rounded">
//                         {children}
//                     </blockquote>
//                 ),
//             }}
//         >
//             {processedContent}
//         </ReactMarkdown>
//     );
// };

const Markdown = ({ content }) => {

    // Process the content to handle special cases and formatting
    const processedContent = content
        .replace(/\\n/g, "\n") // Handle new lines
        .replace(/\\\*/g, "*") // Unescape asterisks
        .replace(/\\"/g, '"') // Unescape quotation marks
        .replace(/##""##/g, "") // Remove ##""## artifacts
        .replace(/""\s*([^:]+):\*\*/g, '**"$1:"**') // Handle ""Text:** pattern
        .replace(/""([^"]+)""/g, '"$1"') // Handle double quotes
        .replace(/(\w+:)"/g, '$1"') // Fix quotes after colons
        .replace(/\*\*"([^"]+)"\*\*/g, '**"$1"**'); // Ensure quotes inside bold text

    // Wrap content in a div for custom greeting and any styling
    const formattedContent = `${processedContent}`;

    return (
        <ReactMarkdown
            className="prose mt-1 w-full break-words prose-p:leading-relaxed py-3 px-3 mark-down"
            remarkPlugins={[remarkGfm]} // This will handle things like tables, strikethrough, etc.
            components={{
                // Custom paragraph renderer with greetings and other text
                p: ({ children }) => (
                    <p className="whitespace-pre-line">
                        {children}
                    </p>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-500 pl-4 py-2 my-2 italic bg-gray-800 rounded">
                        {children}
                    </blockquote>
                ),
                h1: ({ children }) => (
                    <h1 className="font-bold text-xl">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="font-bold text-lg">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="font-bold text-md">{children}</h3>
                ),
                // Handle code blocks
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
                // Ensure lists are rendered as ordered or unordered correctly
                ul: ({ children }) => (
                    <ul className="list-disc pl-5">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal pl-5">
                        {children}
                    </ol>
                ),
                li: ({ children }) => (
                    <li className="my-2">{children}</li>
                ),
                strong: ({ children }) => (
                    <strong className="font-bold">{children}</strong>
                ),
                a: ({ node, ...props }) => (
                    <a
                        {...props}
                        style={{ color: "#27afcf", fontWeight: "bold" }}
                    />
                ),
            }}
        >
            {formattedContent}
        </ReactMarkdown>
    );
};


// Main ChatStream component
const ChatStream = () => {
    // State variables for managing chat
    const [language, setLanguage] = useState("en"); // Language preference, default to English
    const [selectedText, setSelectedText] = useState(""); 
    const [translatedQuestion, setTranslatedQuestion] = useState(""); // Store translated input
    const [response, setResponse] = useState(""); // Store the response
    const { session, isLoaded: sessionLoaded } = useSession();
    const { user, isLoaded: userLoaded } = useUser();
    const [classSelection, setClassSelection] = useState('');
    const [subjectSelection, setSubjectSelection] = useState('');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [selectedSubOption, setSelectedSubOption] = useState("");
    const [userInput, setUserInput] = useState("");
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [chatStarted, setChatStarted] = useState(false);
    const chatContainerRef = useRef(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    // Find the selected category's options
    const selectedCategory = defaultOptions.find(category =>
        category.options.includes(selectedSubOption)
    );
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null); // Store recognition instance

    useEffect(() => {
        // Ensure this only runs on the client side
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                setRecognition(new SpeechRecognition()); // Instantiate SpeechRecognition
            }
        }
    }, []);

    const startListening = () => {
        if (recognition) {
            recognition.start();

            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                setQuestion(transcript);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            setIsListening(true); // Update state when listening starts
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
        }
        setIsListening(false); // Update state when listening stops
    };


    const handleFileUpload = (file) => {
        console.log("File received in parent:", file);
        setUploadedFile(file);
    }

    // Scroll to bottom of chat when new messages are added
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle form submission
    const handleSubmit = async (e) => {
        //const translatedText = await translateText(question, "en");

        // Process the translated question here (e.g., send to AI agent)
        //const aiResponse = await getAIResponse(translatedText); // Placeholder for AI response

        // Translate the AI response back to the user’s language
        //const translatedResponse = await translateText(aiResponse, language);
        //setResponse(translatedResponse);
        e.preventDefault();
        await startChat(question);
    };

    const translateText = async (text) => {
        try {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputText: text }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json(); // Only call this once!
            console.log("Translated Text:", data.translatedText);
            return data.translatedText;
    
        } catch (error) {
            console.error("Translation error:", error);
            return text;
        }
    };
    

    const getAIResponse = async (text) => {
        // Placeholder for AI response logic (e.g., calling an AI model with the input text)
        // For now, just returning the same text as a response for testing
        return `AI Response to: ${text}`;
    };

    const handleTextSelection = (selected) => {
        setSelectedText(selected);
    };

    const handleTranslateSelectedText = async () => {
        if (!selectedText) {
            alert("Please select some text to translate.");
            return;
        }
        const translated = await translateText(selectedText);
        setTranslatedQuestion(translated); // Display translated text
    };

    // Start or continue the chat
    const startChat = async (initialQuestion) => {
        if (!user || !session) {
            console.error("User or session not ready yet.");
            return; // Don't start chat if auth info is missing
        }
        // Update state and prepare for chat
        setChatStarted(true);
        setQuestion("");

        setMessages((prev) => [
            ...prev,
            { type: "user", content: initialQuestion },
            { type: "ai", content: "" },
        ]);

        const allOptions = [...uploadOptions, ...uploadOptions2];
        const isInOptions = allOptions.some(option => option.title === initialQuestion);
        const curriculumOptions = defaultOptions.find(
            item => item.title === "Curriculum Based Q&A"
        )?.options || [];

        const normalize = str => str.toLowerCase().replace(/\s+/g, ''); // remove spaces, lowercase

        const normalizedQuestion = normalize(initialQuestion);

        const isCurriculumBased = curriculumOptions.some(option =>
            normalizedQuestion.includes(normalize(option))
        );

        if (isCurriculumBased || isInOptions) {
            // Do something if initialQuestion contains one of the options
            try {
                let pdfName = "";

                console.log(uploadedFile.name)

                if(isCurriculumBased){
                    pdfName = initialQuestion;
                }if(isInOptions){
                    pdfName = uploadedFile.name;
                }

                console.log(pdfName)

                const response = await fetch(`/api/pdfetch?source=${encodeURIComponent(pdfName)}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const fullText = data.fullText;

                initialQuestion = initialQuestion+ " " +fullText;
            } catch (error) {
                console.error("Error fetching and processing PDF data:", error);
            }            
        }
        try {
            // Send request to chat AP
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  question: initialQuestion,
                  sender: user?.id,
                  session: session
                }),
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
              
                const chunk = decoder.decode(value, { stream: true });

                //Handle potential multiple JSON objects in the chunk
                const lines = chunk.split('\n').filter((line) => line.trim().startsWith('{') && line.trim().endsWith('}'));

                for (const line of lines) {
                    try {
                        const eline = emoji.replace_colons(line)
                        const { text, lastWord: newLastWord, isLast } = JSON.parse(eline);

                        setMessages((prev) => {
                            const newMessages = [...prev];
                            const lastMessage = newMessages[newMessages.length - 1];

                            if (lastMessage?.type === "ai") {
                                const existingContent = lastMessage.content;

                                let overlapLength = 0;
                                const minLength = Math.min(existingContent.length, text.length);

                                for (let i = 0; i < minLength; i++) {
                                    if (existingContent.endsWith(text.substring(0, i + 1))) {
                                        overlapLength = i + 1;
                                    }
                                }

                                const newContent = text.substring(overlapLength);
                                lastMessage.content = existingContent + " " + newContent;
                            }

                            return newMessages;
                        });

                        lastWord = newLastWord;

                        if (isLast) break;
                    } catch (err) {
                        console.error("JSON parse error for line:", line, err);
                    }
                }
            }
        } catch (error) {
            // Handle fetch, stream, or unexpected errors
            console.error("Error in chat:", error);

            setMessages((prev) => [
                ...prev,
                {
                    type: "error",
                    content: `An error occurred while processing your request: ${error.message}`,
                },
            ]);
        }
    };

    // Render the chat interface
    return (
        <div className="flex flex-col min-h-screen bg-white text-gray-600">
            <Navbar />
            <div className="flex flex-grow w-full overflow-hidden">
                {/* History Sidebar */}

                <div
                    className={`sidebar custom-scrollbar transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 p-0' : 'w-1/5 p-4'} bg-[#ecf7f3] relative overflow-hidden flex flex-col justify-between shadow-lg`}
                >
                    {/* Show title/content only when expanded */}
                    {!isCollapsed && (
                        <ChatHistory className="shadow-xl p-4 rounded-lg" />
                    )}
                </div>

                {/* Toggle Button - absolutely positioned outside the sidebar */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`toggle-button absolute top-[50%] transform -translate-y-1/2 transition-all duration-300 ${isCollapsed ? 'left-2' : 'left-[20%]'} p-1 bg-white rounded-full shadow z-50`}
                    aria-expanded={!isCollapsed}
                    aria-label="Toggle sidebar"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>


                {/* Main Content */}
                <div className={`main-content custom-scrollbar flex flex-col flex-grow ${isCollapsed ? 'w-full' : 'w-4/5'} transition-all duration-300 mx-4`}>
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
                                    className={`flex ${message.type === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                        }`}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className={`max-w-[80%] rounded-2xl shadow-lg ${message.type === "user"
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
                    {/* Upload Section */}
                    <div className="mb-4">
                        {!chatStarted && !selectedSubOption && (
                            <div>
                                <DocumentUpload onFileUpload={handleFileUpload}></DocumentUpload>
                                {/* Task Options */}
                                <div className="mt-4 text-center">
                                    <p className="text-gray-600 mb-3">
                                        What do you want to do with uploaded data:
                                    </p>

                                    {/* Top 3 Action Buttons */}
                                    <div className="flex justify-between gap-2">
                                        {uploadOptions.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedOptionIndex(index);
                                                    startChat(option.title);
                                                    setUserInput("");
                                                }} className="bg-[#ebf6f2] text-[#435e65] px-4 py-2 rounded-lg w-1/3">
                                                {option.title}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Solve & Verify Buttons */}
                                    <div className="flex justify-center gap-4 mt-5 bg-[#d2e7e2]">
                                        {uploadOptions2.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedOptionIndex(index); // make sure `index` is defined in your scope
                                                    startChat(option.title);
                                                    setUserInput("");
                                                }}
                                                className={`${option.bgColor} ${option.hoverColor} text-white px-5 py-2 rounded-t-xl shadow w-1/3 mt-5`}
                                            >
                                                {option.title}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Hint */}
                                    <p className="text-gray-500 text-sm mt-2 italic">
                                        Works for all the subjects and classes.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Chat input form */}
                    <form onSubmit={handleSubmit} className="flex items-center">
                        <motion.input
                            whileFocus={{ scale: 1.02 }}
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask anything here..."
                            //onKeyUp={(e) => handleTextSelection(e.target.value)}
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

                        {/* Voice Input Button */}
                        <button
                            type="button"
                            onClick={isListening ? stopListening : startListening}
                            className="ml-2 p-2 rounded-xl bg-[#effaf8] text-gray-600 focus:outline-none"
                        >
                            {isListening ? <CiMicrophoneOff className="text-xl" style={{ color: '#4a7f85' }}/> : <CiMicrophoneOn className="text-xl" style={{ color: '#4a7f85' }}/>}
                        </button>
                        {/* <button
                            type="button"
                            onClick={handleTranslateSelectedText}
                            className="mt-2 p-2 rounded-xl bg-[#effaf8] text-gray-600 focus:outline-none"
                        >
                            Translate Selected Text
                        </button>

                        <div>
                            <h3>Translated Text:</h3>
                            <p>{translatedQuestion}</p>
                        </div>

                        <div>
                            <h3>Response:</h3>
                            <p>{response}</p>
                        </div> */}
                    </form>
                    {/* Chat input area */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Display default options if chat hasn't started */}
                        {!chatStarted && !selectedSubOption && (
                            <div>
                                <h2 className="text-gray-600 text-center mb-4">
                                    What else can we help you with? Select from below icon
                                </h2>
                                <div className="grid grid-cols-4 gap-10 mb-6">
                                    {defaultOptions.map((optionGroup, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`h-auto min-h-60 w-56 p-4 ${colors[index]} text-gray-600 rounded-xl transition-colors text-sm font-medium shadow-md flex flex-col justify-start text-center`}
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
                                                        className="flex items-center gap-2 text-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-200 hover:brightness-110 text-left w-full"
                                                    >
                                                        <IoMdCheckmark className="text-[#47735a]" />
                                                        <span className="rounded-lg bg-white p-2">{sub}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                    {/* Input area only for the selected sub-option */}
                    {selectedSubOption && !chatStarted && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white w-1/2 h-1/2 rounded-lg shadow-lg flex flex-col justify-center items-center p-6">
                                <h2 className="text-md font-semibold mb-4 text-center">
                                    Ask a query about <span className="text-blue-600">{selectedSubOption}</span>
                                </h2>

                                {boardBasedOptions.includes(selectedSubOption) ? (
                                    <div className="space-y-4 w-full">
                                        <div>
                                            <label htmlFor="class" className="block text-sm font-semibold mb-2">Select Class</label>
                                            <select
                                                id="class"
                                                className="w-full px-4 py-2 text-lg text-black border border-gray-300 rounded"
                                                onChange={(e) => setClassSelection(e.target.value)}
                                                value={classSelection}
                                            >
                                                <option value="">Select Class</option>
                                                {classOptions.map((cls) => (
                                                    <option key={cls} value={cls}>{cls}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-semibold mb-2">Select Subject</label>
                                            <select
                                                id="subject"
                                                className="w-full px-4 py-2 text-lg text-black border border-gray-300 rounded"
                                                onChange={(e) => setSubjectSelection(e.target.value)}
                                                value={subjectSelection}
                                            >
                                                <option value="">Select Subject</option>
                                                {subjectOptions.map((subj) => (
                                                    <option key={subj} value={subj}>{subj}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex">
                                        <textarea
                                            rows={1}
                                            className="w-full px-4 py-2 text-lg text-black border border-gray-300 rounded mb-4 resize-none overflow-auto placeholder:text-xl placeholder:leading-8 max-h-40"
                                            placeholder={`Enter ${selectedSubOption} query...`}
                                            value={userInput}
                                            onChange={(e) => {
                                                setUserInput(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={isListening ? stopListening : startListening}
                                            className="m-2 p-2 rounded-xl bg-[#effaf8] focus:outline-none"
                                        >
                                            {isListening ? <CiMicrophoneOff className="text-xl" style={{ color: '#4a7f85' }} /> : <CiMicrophoneOn className="text-xl" style={{ color: '#4a7f85' }} />}
                                        </button>
                                    </div>
                                )}

                                <div className="flex space-x-4 mt-4">
                                    <button
                                        onClick={() => {
                                            const query = boardBasedOptions.includes(selectedSubOption)
                                                ? `Board: ${selectedSubOption}, Class: ${classSelection}, Subject: ${subjectSelection}`
                                                : `${selectedSubOption} ${userInput}`;
                                            startChat(query);
                                        }}
                                        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 text-sm"
                                    >
                                        Submit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedSubOption(null);
                                            setUserInput('');
                                            setClassSelection('');
                                            setSubjectSelection('');
                                        }}
                                        className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ChatStream;
