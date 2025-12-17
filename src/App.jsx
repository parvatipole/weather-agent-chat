import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

// ChatInput Component
function ChatInput({ onSend, disabled = false, placeholder = "Ask about weather...", focusMode = false }) {
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
    <div className={`input-container ${focusMode ? 'focus-input' : ''}`}>
      <div className="input-wrapper">
        <div className="input-field">
          <textarea
            ref={textareaRef}
            className={`message-textarea ${disabled ? 'disabled' : ''} ${focusMode ? 'focus-textarea' : ''}`}
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={focusMode ? 4 : 1}
            aria-label="Type your message here"
          />
          {text.length > 500 && (
            <div className="char-count">
              {text.length}/1000
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={`send-button ${disabled || !text.trim() ? 'disabled' : ''} ${focusMode ? 'focus-send' : ''}`}
          title={disabled ? "Please wait..." : "Send message (Enter)"}
          aria-label={disabled ? "Please wait for response" : "Send message"}
        >
          {disabled ? (
            <div className="spinner"></div>
          ) : (
            <svg className="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      <div className="input-helper">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {disabled && <span className="sending-indicator">Getting response...</span>}
      </div>
    </div>
  );
}

// Helper function to highlight keywords in message text
function highlightKeywords(text) {
  if (!text) return text;

  // Keyword patterns for highlighting
  const patterns = [
    { regex: /\b(?:Delhi|Mumbai|Bangalore|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Lucknow|London|New York|Paris|Tokyo|Sydney|Toronto|Dubai|Singapore|Hong Kong|Bangkok|Seoul|Bangkok|Mexico City|Berlin|Madrid|Rome|Amsterdam|Bangkok|Istanbul|Cairo|Bangkok|Moscow|Dubai|Bangkok|Bangkok|Bangkok|Bangkok)\b/gi, class: 'highlight-city' },
    { regex: /(\d+)(?:°C|°F|°|C|F)/g, class: 'highlight-temp' },
    { regex: /\b(?:rain|raining|rainfall|rainy|storm|storms|thunder|thunderstorm|snow|snowing|sunny|sunny|cloudy|cloud|clouds|fog|foggy|hail|drizzle|windy|wind|hurricane|tornado|cyclone|monsoon)\b/gi, class: 'highlight-weather' },
  ];

  let highlightedText = text;
  patterns.forEach(({ regex, class: className }) => {
    highlightedText = highlightedText.replace(regex, (match) => `<mark class="${className}">${match}</mark>`);
  });

  return highlightedText;
}

// MessageBubble Component
function MessageBubble({ message, isLoading = false, focusMode = false }) {
  const isUser = message.role === "user";
  const isError = message.error;

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "";

  const highlightedContent = focusMode && !isUser ? highlightKeywords(message.content || "") : null;

  return (
    <div className={`message-group ${isUser ? 'user-message' : 'agent-message'} ${focusMode ? 'focus-mode' : ''}`}>
      {!isUser && (
        <div className="message-avatar agent-avatar">
          <div className="avatar-icon" aria-label="Weather assistant">🤖</div>
        </div>
      )}
      <div className={`message-content ${isUser ? 'user-content' : 'agent-content'}`}>
        <div className={`message-bubble ${isError ? 'error-bubble' : isUser ? 'user-bubble' : 'agent-bubble'} ${isLoading ? 'loading' : ''} ${focusMode ? 'focus-bubble' : ''}`}>
          {isLoading && (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div className="message-text">
            {focusMode && !isUser && highlightedContent ? (
              <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
            ) : (
              message.content || (isLoading ? "Thinking..." : "")
            )}
          </div>
        </div>
        <div className={`message-time ${isUser ? 'user-time' : ''}`}>
          {formattedTime}
        </div>
      </div>
      {isUser && (
        <div className="message-avatar user-avatar">
          <div className="avatar-icon" aria-label="You">👤</div>
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
  const [focusMode, setFocusMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("/api/agents/weatherAgent/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`API error (${response.status}): ${errorText || 'Server returned an error'}`);
      }

      if (response.body && response.body.getReader) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith(':')) continue;
            
            if (trimmedLine.startsWith('data:')) {
              const data = trimmedLine.slice(5).trim();
              
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                let textToAppend = "";
                
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
                }
                
                if (textToAppend) {
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
              } catch (e) {
                if (data && data !== '[DONE]') {
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
            }
          }
        }

        if (buffer.trim()) {
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
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to fetch response");
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "agent",
          content: "Sorry, I couldn't get the weather information right now. Please check your connection and try again.",
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

  const lastAgentMessage = [...messages].reverse().find(m => m.role === 'agent');
  const previousMessages = messages.filter((m, idx) => idx < messages.length - (lastAgentMessage ? 1 : 0));

  return (
    <div className={`chat-container ${focusMode ? 'focus-mode-active' : ''}`}>
      <div className="chat-header">
        <div className="header-content">
          <div className="header-icon">🌤️</div>
          <div className="header-text">
            <h1 className="header-title">Weather Assistant</h1>
            <p className="header-subtitle">Ask me about the weather anywhere</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`focus-toggle-button ${focusMode ? 'active' : ''}`}
            title={focusMode ? "Disable Inclusive Focus Mode" : "Enable Inclusive Focus Mode (for PWD)"}
            aria-label={focusMode ? "Disable accessible focus mode" : "Enable accessible focus mode"}
            aria-pressed={focusMode}
          >
            <svg className="focus-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {focusMode && previousMessages.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="history-toggle-button"
              title={showHistory ? "Hide chat history" : "Show chat history"}
              aria-label={showHistory ? "Hide previous messages" : "Show previous messages"}
              aria-pressed={showHistory}
            >
              <span className="history-count">{previousMessages.length}</span>
              <svg className="history-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          <button
            onClick={clearChat}
            className="clear-button"
            title="Clear chat"
            aria-label="Clear all messages"
          >
            <svg className="clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {focusMode && showHistory && previousMessages.length > 0 && (
        <div className="history-drawer">
          <div className="history-header">
            <h3>Chat History ({previousMessages.length})</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="close-history"
              aria-label="Close history drawer"
            >
              ✕
            </button>
          </div>
          <div className="history-messages">
            {previousMessages.map((message, index) => (
              <div key={`history-${message.timestamp}-${index}`} className="history-message">
                <span className="history-role">{message.role === 'user' ? '👤 You' : '🤖 Assistant'}</span>
                <p className="history-text">{message.content}</p>
                <span className="history-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`messages-area ${focusMode ? 'focus-messages' : ''}`}>
        {focusMode && lastAgentMessage ? (
          <MessageBubble
            key={`focus-${lastAgentMessage.timestamp}`}
            message={lastAgentMessage}
            isLoading={lastAgentMessage.loading}
            focusMode={true}
          />
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={`${message.timestamp}-${index}`}
              message={message}
              isLoading={message.loading}
              focusMode={focusMode}
            />
          ))
        )}

        {error && (
          <div className="error-notification">
            <div className="error-content">
              <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="error-text">
                <p className="error-message">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
                    if (lastUserMessage) {
                      sendMessage(lastUserMessage.content);
                    }
                  }}
                  className="error-retry"
                >
                  Try again
                </button>
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
        focusMode={focusMode}
      />
    </div>
  );
}

// Main App Component
export default function App() {
  return (
    <div className="app-background">
      <div className="app-container">
        <ChatWindow />
      </div>
    </div>
  );
}
