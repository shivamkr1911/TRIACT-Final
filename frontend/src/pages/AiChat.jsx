// frontend/src/pages/AiChat.jsx

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";

const CHAT_STORAGE_KEY = "triactAiChatHistory";

const AiChat = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages;
        }
      } catch (e) {
        console.error("Failed to parse chat history from localStorage:", e);
      }
    }
    return [
      {
        sender: "ai",
        text: "Hi! I'm your TRIACT AI assistant. Ask me questions about your inventory, sales, or employees.",
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (
      messages.length > 1 ||
      messages[0].sender !== "ai" ||
      messages[0].text !==
        "Hi! I'm your TRIACT AI assistant. Ask me questions about your inventory, sales, or employees."
    ) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { answer } = await shopService.getAiChatResponse(
        user.shopId,
        input
      );
      const aiMessage = { sender: "ai", text: answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "ai",
        text: "Sorry, I ran into an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Failed to get AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([
      {
        sender: "ai",
        text: "Chat history cleared. How can I help you?",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto bg-gradient-to-tr from-blue-50 via-purple-50 to-pink-50 shadow-2xl rounded-3xl border border-gray-100 overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 rounded-t-3xl">
        <h1 className="text-lg sm:text-xl font-semibold text-purple-700 flex items-center space-x-2">
          <span>🧠</span>
          <span>TRIACT AI Assistant</span>
        </h1>
        <button
          onClick={clearChatHistory}
          className="text-xs sm:text-sm text-gray-600 hover:text-red-600 border border-gray-300 px-3 py-1 rounded-lg transition-colors duration-200 hover:border-red-600"
          title="Clear chat history"
        >
          Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-transparent scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end ${
              msg.sender === "ai" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-lg text-sm transition-all duration-300 break-words ${
                msg.sender === "ai"
                  ? "bg-blue-100 text-gray-900 border border-blue-200"
                  : "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[60%] px-4 py-3 rounded-2xl bg-blue-100 border border-blue-200 text-gray-800 shadow-sm">
              <p className="animate-pulse">AI is thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center px-5 py-4 border-t bg-white/80 backdrop-blur-md rounded-b-3xl space-x-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about inventory, sales, or employees..."
          className="flex-1 border border-gray-300 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none placeholder-gray-400 disabled:bg-gray-100 transition-all duration-150"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-2.5 rounded-2xl font-medium text-sm transition-colors duration-200 disabled:bg-gray-400"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AiChat;
