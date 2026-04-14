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
              "max-w-[80%] rounded-lg px-4 py-2 text-sm",
              msg.role === "user"
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-900"
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
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
      ))}
    </div>
  );
}
