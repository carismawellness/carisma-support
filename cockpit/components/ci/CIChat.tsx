"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql_query?: string;
}

export function CIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Load conversation history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/ci/history");
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        }
      } catch {
        // History load failed silently — start fresh
      }
    }
    loadHistory();
  }, []);

  const handleSend = useCallback(async (content: string) => {
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Add a placeholder assistant message for streaming
    const placeholderMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, placeholderMsg]);

    try {
      const res = await fetch("/api/ci/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      // Check if response is SSE stream or JSON fallback
      const contentType = res.headers.get("Content-Type") || "";

      if (contentType.includes("text/event-stream") && res.body) {
        // Streaming response
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let sqlQuery: string | undefined;
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.sql_query) {
                sqlQuery = data.sql_query;
              }

              if (data.text) {
                fullText += data.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: fullText,
                    sql_query: sqlQuery,
                  };
                  return updated;
                });
              }

              if (data.done) break;
              if (data.error) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again.",
                  };
                  return updated;
                });
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        // Ensure final state is set even if no done event
        if (fullText) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: fullText,
              sql_query: sqlQuery,
            };
            return updated;
          });
        }
      } else {
        // JSON fallback (non-streaming)
        const data = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content:
              data.message || "Sorry, I couldn't process that request.",
            sql_query: data.sql_query,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Connection error. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-gold" />
          Carisma Intelligence
        </CardTitle>
      </CardHeader>
      <MessageList messages={messages} loading={loading} />
      <MessageInput onSend={handleSend} disabled={loading} />
    </Card>
  );
}
