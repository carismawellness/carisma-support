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
  return (
    <div className="space-y-4 max-h-64 overflow-y-auto p-4">
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
    </div>
  );
}
