import { useState, useRef, useEffect, useCallback } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import useWeatherAgent from "../hooks/useWeatherAgent";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content: "Hello! I'm your weather assistant. Ask me about the weather in any city!",
      timestamp: new Date().toISOString()
    }
  ]);

  const { sendMessage, loading, error, clearError } = useWeatherAgent(setMessages);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (text) => {
    clearError();
    await sendMessage(text);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "agent",
        content: "Hello! I'm your weather assistant. Ask me about the weather in any city!",
        timestamp: new Date().toISOString()
      }
    ]);
    clearError();
  };

  return (
    <div className="w-full max-w-2xl h-[90vh] bg-white shadow-xl rounded-lg flex flex-col mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🌤️</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Weather Assistant</h1>
            <p className="text-sm text-gray-600">Ask me about the weather anywhere</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Clear chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0"
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.timestamp}-${index}`}
            message={message}
            isLoading={message.loading}
          />
        ))}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">{error}</p>
                  <button
                    onClick={() => {
                      clearError();
                      // Retry the last user message if available
                      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
                      if (lastUserMessage) {
                        handleSendMessage(lastUserMessage.content);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={loading}
        placeholder={loading ? "Getting weather information..." : "Ask about weather..."}
      />
    </div>
  );
}
