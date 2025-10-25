// frontend/src/pages/AiChat.jsx

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";

const AiChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I'm your TRIACT AI assistant. Ask me questions about your inventory, sales, or employees.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-xl font-bold p-4 border-b text-gray-800">
        AI Inventory Assistant
      </h1>
      
      {/* Message Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "ai" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow ${
                msg.sender === "ai"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-indigo-600 text-white"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-3 rounded-lg shadow bg-gray-100 text-gray-800">
              <p className="animate-pulse">AI is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your inventory..."
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AiChat;