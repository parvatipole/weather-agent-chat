import { useState, useRef, useEffect, useCallback } from 'react';

// ChatInput Component
function ChatInput({ onSend, disabled = false, placeholder = "Ask about weather..." }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText && !disabled) {
      onSend(trimmedText);
      setText("");
    }
  };

  return (
    <div className="p-4 border-t bg-gray-50 rounded-b-lg">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className={`w-full resize-none border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} min-h-[44px] max-h-32`}
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
          {text.length > 500 && (
            <div className="absolute bottom-1 right-3 text-xs text-gray-400">
              {text.length}/1000
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${disabled || !text.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg'}`}
          title={disabled ? "Please wait..." : "Send message (Enter)"}
        >
          {disabled ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {disabled && <span className="text-blue-500">Getting response...</span>}
      </div>
    </div>
  );
}

// MessageBubble Component
function MessageBubble({ message, isLoading = false }) {
  const isUser = message.role === "user";
  const isError = message.error;

  const formattedTime = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">🤖</span>
          </div>
        </div>
      )}
      <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl shadow-sm relative ${isUser ? "bg-blue-500 text-white rounded-br-md" : isError ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-md" : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"} ${isLoading ? "animate-pulse" : ""}`}>
          {isLoading && (
            <div className="flex items-center space-x-1 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content || (isLoading ? "Thinking..." : "")}
          </div>
        </div>
        <div className={`text-xs text-gray-500 mt-1 px-2 ${isUser ? "text-right" : "text-left"}`}>
          {formattedTime}
        </div>
      </div>
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

// Main ChatWindow Component
function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content: "Hello! I'm your weather assistant. Ask me about the weather in any city!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;

    setLoading(true);
    setError(null);

    const userMsg = { role: "user", content: text, timestamp: new Date().toISOString() };
    const agentPlaceholder = { role: "agent", content: "", timestamp: new Date().toISOString(), loading: true };

    setMessages(prev => [...prev, userMsg, agentPlaceholder]);

    try {
      // Build the request payload
      const payload = {
        messages: [{ role: "user", content: text }],
        runId: "weatherAgent",
        maxRetries: 2,
        maxSteps: 5,
        temperature: 0.5,
        topP: 1,
        runtimeContext: {},
        threadId: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        resourceId: "weatherAgent"
      };

      console.log("Sending request with payload:", payload);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        "https://brief-thousands-sunset-9fcb1c78-485f-4967-ac04-2759a8fa1462.mastra.cloud/api/agents/weatherAgent/stream",
        {
          method: "POST",
          headers: {
            "Accept": "text/event-stream, application/json, */*",
            "Content-Type": "application/json",
            "x-mastra-dev-playground": "true"
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        }
      );

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error("Error response:", errorText);
        throw new Error(`API error (${response.status}): ${errorText || 'Server returned an error'}`);
      }

      // Handle streaming response
      const contentType = response.headers.get('content-type');
      console.log("Content-Type:", contentType);

      if (response.body && response.body.getReader) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let hasContent = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("Stream complete");
              break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            console.log("Received chunk, buffer length:", buffer.length);
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine.startsWith(':')) continue;
              
              console.log("Processing line:", trimmedLine);
              
              if (trimmedLine.startsWith('data:')) {
                const data = trimmedLine.slice(5).trim();
                
                if (data === '[DONE]') {
                  console.log("Received [DONE] signal");
                  continue;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  console.log("Parsed data:", parsed);
                  
                  let textToAppend = "";
                  
                  // Handle various response formats
                  if (typeof parsed === 'string') {
                    textToAppend = parsed;
                  } else if (parsed.content) {
                    textToAppend = parsed.content;
                  } else if (parsed.text) {
                    textToAppend = parsed.text;
                  } else if (parsed.delta) {
                    textToAppend = parsed.delta;
                  } else if (parsed.choices && parsed.choices[0]?.delta?.content) {
                    textToAppend = parsed.choices[0].delta.content;
                  } else if (parsed.message?.content) {
                    textToAppend = parsed.message.content;
                  }
                  
                  if (textToAppend) {
                    hasContent = true;
                    setMessages(prev => {
                      const copy = [...prev];
                      const last = copy[copy.length - 1];
                      copy[copy.length - 1] = {
                        ...last,
                        content: (last.content || "") + textToAppend,
                        loading: false
                      };
                      return copy;
                    });
                  }
                } catch (parseError) {
                  console.log("Non-JSON data, treating as text:", data);
                  if (data && data !== '[DONE]') {
                    hasContent = true;
                    setMessages(prev => {
                      const copy = [...prev];
                      const last = copy[copy.length - 1];
                      copy[copy.length - 1] = {
                        ...last,
                        content: (last.content || "") + data,
                        loading: false
                      };
                      return copy;
                    });
                  }
                }
              } else if (trimmedLine) {
                // Line without 'data:' prefix
                console.log("Line without data prefix:", trimmedLine);
              }
            }
          }

          // Process remaining buffer
          if (buffer.trim()) {
            console.log("Processing remaining buffer:", buffer);
            hasContent = true;
            setMessages(prev => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = {
                ...last,
                content: (last.content || "") + buffer.trim(),
                loading: false
              };
              return copy;
            });
          }

          // If no content received, show error
          if (!hasContent) {
            throw new Error("No response received from the weather agent");
          }
        } catch (streamError) {
          console.error("Stream reading error:", streamError);
          throw streamError;
        }
      } else {
        // Fallback: read full response as text
        console.log("No streaming support, reading full response");
        const fullText = await response.text();
        console.log("Full response text:", fullText);
        
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: fullText || "No response received",
            loading: false
          };
          return copy;
        });
      }
    } catch (err) {
      console.error("Error details:", err);
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      
      let errorMessage = "Failed to connect to weather service. ";
      
      if (err.name === 'AbortError') {
        errorMessage = "Request timed out. The weather service took too long to respond.";
      } else if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        errorMessage = "Cannot connect to weather service. This could be due to:\n" +
                      "• CORS restrictions (the API may not allow browser requests)\n" +
                      "• Network connectivity issues\n" +
                      "• The API endpoint may be temporarily unavailable\n\n" +
                      "💡 Tip: Contact your instructor or check if the API requires a proxy server.";
      } else {
        errorMessage = err.message || "An unknown error occurred";
      }
      
      setError(errorMessage);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "agent",
          content: "I apologize, but I'm having trouble connecting to the weather service right now. This appears to be a network or API configuration issue.\n\n" +
                  "If you're the developer: Check the browser console for detailed error information.",
          timestamp: new Date().toISOString(),
          error: true
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "agent",
        content: "Hello! I'm your weather assistant. Ask me about the weather in any city!",
        timestamp: new Date().toISOString()
      }
    ]);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl h-[90vh] bg-white shadow-xl rounded-lg flex flex-col mx-auto">
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

      <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.timestamp}-${index}`}
            message={message}
            isLoading={message.loading}
          />
        ))}

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
                      setError(null);
                      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
                      if (lastUserMessage) {
                        sendMessage(lastUserMessage.content);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium underline"
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

      <ChatInput
        onSend={sendMessage}
        disabled={loading}
        placeholder={loading ? "Getting weather information..." : "Ask about weather..."}
      />
    </div>
  );
}

// Main App Component
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-4">
      <div className="max-w-6xl mx-auto h-full">
        <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}