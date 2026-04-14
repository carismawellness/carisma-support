import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql_query?: string;
}

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change (including streaming updates)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-4 max-h-64 overflow-y-auto p-4">
      {messages.map((msg, i) => {
        const isStreaming =
          loading &&
          msg.role === "assistant" &&
          i === messages.length - 1 &&
          msg.content.length > 0;

        return (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                msg.role === "user"
                  ? "bg-navy text-white"
                  : "bg-gray-100 text-gray-900"
              )}
            >
              {msg.content ? (
                <p className="whitespace-pre-wrap">
                  {msg.content}
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-text-bottom" />
                  )}
                </p>
              ) : msg.role === "assistant" && loading ? (
                <p className="text-gray-400 italic">Thinking...</p>
              ) : null}
              {msg.sql_query && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-400 cursor-pointer">
                    View SQL query
                  </summary>
                  <pre className="mt-1 text-xs bg-gray-200 rounded p-2 overflow-x-auto">
                    {msg.sql_query}
                  </pre>
                </details>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
