import { useMemo } from "react";

export default function MessageBubble({ message, isLoading = false }) {
  const isUser = message.role === "user";
  const isError = message.error;

  // Format timestamp
  const formattedTime = useMemo(() => {
    if (!message.timestamp) return "";
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [message.timestamp]);

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar for agent messages */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">🤖</span>
          </div>
        </div>
      )}

      {/* Message bubble */}
      <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-sm relative
            ${isUser
              ? "bg-blue-500 text-white rounded-br-md"
              : isError
                ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-md"
                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
            }
            ${isLoading ? "animate-pulse" : ""}
          `}
        >
          {/* Loading indicator for streaming messages */}
          {isLoading && (
            <div className="flex items-center space-x-1 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}

          {/* Message content */}
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content || (isLoading ? "Thinking..." : "")}
          </div>
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 px-2 ${isUser ? "text-right" : "text-left"}`}>
          {formattedTime}
        </div>
      </div>

      {/* Avatar for user messages */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">👤</span>
          </div>
        </div>
      )}
    </div>
  );
}
