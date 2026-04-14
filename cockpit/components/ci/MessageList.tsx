import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql_query?: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
          <p className="text-sm">Ask me anything about your business data.</p>
          <p className="text-xs mt-1 opacity-60">Revenue, KPIs, trends, comparisons...</p>
        </div>
      )}
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            "flex",
            msg.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
              msg.role === "user"
                ? "bg-gold text-white"
                : "bg-warm-gray text-charcoal"
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            {msg.sql_query && (
              <details className="mt-2">
                <summary className="text-xs opacity-70 cursor-pointer">
                  View SQL query
                </summary>
                <pre className="mt-1 text-xs bg-white/20 rounded-lg p-2 overflow-x-auto">
                  {msg.sql_query}
                </pre>
              </details>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
