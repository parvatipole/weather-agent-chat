import { useState, useCallback } from "react";

// Default placeholder thread id — replace if you want a persistent value
const defaultThreadId = () => "YOUR_COLLEGE_ROLL_NUMBER";

export default function useWeatherAgent(setMessages) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threadId] = useState(defaultThreadId());

  const clearError = useCallback(() => setError(null), []);

  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim()) return;

      setLoading(true);
      setError(null);

      const userMsg = { role: "user", content: text, timestamp: new Date().toISOString() };
      const agentPlaceholder = { role: "agent", content: "", timestamp: new Date().toISOString(), loading: true };

      // Optimistically add user + agent placeholder
      setMessages((prev) => [...prev, userMsg, agentPlaceholder]);

      try {
        const response = await fetch(
          "https://brief-thousands-sunset-9fcb1c78-485f-4967-ac04-2759a8fa1462.mastra.cloud/api/agents/weatherAgent/stream",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream, text/plain, application/json, */*",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              "x-mastra-dev-playground": "true",
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: text }],
              runId: "weatherAgent",
              maxRetries: 2,
              maxSteps: 5,
              temperature: 0.5,
              topP: 1,
              runtimeContext: {},
              threadId:
                typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              resourceId: "weatherAgent",
            }),
          }
        );

        if (!response.ok) {
          const txt = await response.text().catch(() => "");
          throw new Error(`Server error ${response.status}${txt ? `: ${txt}` : ""}`);
        }

        let agentText = "";

        if (response.body && response.body.getReader) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          // Buffer and parse SSE-style or newline-delimited chunks
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // split on empty lines (SSE events are separated by "\n\n")
            const parts = buffer.split(/\n\n/);
            // last part may be incomplete, keep it in buffer
            buffer = parts.pop();

            for (const part of parts) {
              // extract data: lines
              const dataLines = part
                .split(/\n/)
                .map((l) => (l.startsWith("data:") ? l.slice(5).trim() : l.trim()))
                .filter(Boolean);

              const data = dataLines.join("\n");
              if (!data) continue;

              if (data === "[DONE]") {
                buffer = "";
                break;
              }

              // try parse JSON, otherwise append raw text
              let toAppend = data;
              try {
                const parsed = JSON.parse(data);
                // Common fields to extract
                if (typeof parsed === "string") toAppend = parsed;
                else if (parsed.content) toAppend = parsed.content;
                else if (parsed.text) toAppend = parsed.text;
                else if (parsed.delta) toAppend = parsed.delta;
                else toAppend = JSON.stringify(parsed);
              } catch (e) {
                // not JSON — use raw data
              }

              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const copy = [...prev];
                const last = copy[copy.length - 1];
                copy[copy.length - 1] = { ...last, content: (last.content || "") + toAppend, loading: false };
                return copy;
              });
            }
          }

          // flush any remaining buffer
          if (buffer) {
            const remaining = buffer.trim();
            if (remaining) {
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const copy = [...prev];
                const last = copy[copy.length - 1];
                copy[copy.length - 1] = { ...last, content: (last.content || "") + remaining, loading: false };
                return copy;
              });
            }
          }
        } else {
          // Fallback: read full text
          agentText = await response.text();
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: agentText, loading: false };
            return copy;
          });
        }

        return;
      } catch (err) {
        console.error("useWeatherAgent error:", err);
        setError(err.message || "Failed to fetch response");
        // Replace placeholder with an error message
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "agent",
            content:
              "Sorry, I couldn't get the weather information right now. Please check your connection and try again.",
            timestamp: new Date().toISOString(),
            error: true,
          };
          return copy;
        });
      } finally {
        setLoading(false);
      }
    },
    [setMessages]
  );

  return { sendMessage, loading, error, clearError };
}
