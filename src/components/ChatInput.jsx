import { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSend, disabled = false, placeholder = "Ask about weather..." }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
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

  const handleChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="p-4 border-t bg-gray-50 rounded-b-lg">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className={`
              w-full resize-none border rounded-lg px-4 py-3 pr-12
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200 ease-in-out
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              min-h-[44px] max-h-32
            `}
            placeholder={placeholder}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />

          {/* Character count indicator (optional) */}
          {text.length > 500 && (
            <div className="absolute bottom-1 right-3 text-xs text-gray-400">
              {text.length}/1000
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={`
            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
            transition-all duration-200 ease-in-out shadow-md
            ${disabled || !text.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white hover:shadow-lg'
            }
          `}
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

      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {disabled && <span className="text-blue-500">Getting response...</span>}
      </div>
    </div>
  );
}
