"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql_query?: string;
}

interface CIChatProps {
  embedded?: boolean;
}

export function CIChat({ embedded }: CIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(content: string) {
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ci/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.message || "Sorry, I couldn't process that request.",
        sql_query: data.sql_query,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // When embedded in the floating panel, render without Card wrapper
  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} />
        </div>
        <MessageInput onSend={handleSend} disabled={loading} />
      </div>
    );
  }

  return (
    <Card className="rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-charcoal">
          <div className="h-7 w-7 rounded-lg bg-gold/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-gold" />
          </div>
          Carisma Intelligence
        </CardTitle>
      </CardHeader>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} disabled={loading} />
    </Card>
  );
}
