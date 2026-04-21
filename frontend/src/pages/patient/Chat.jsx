import { useRef, useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles } from "lucide-react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I'm Aura. I'm here to listen. What's on your mind today?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setBusy(true);
    try {
      const r = await api.post("/chat/", { message: userMsg });
      setMessages((m) => [...m, { role: "assistant", text: r.data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "I'm having trouble right now. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-14rem)]" data-testid="chat-page">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-3 w-3" /> Aura companion
        </div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">Talk it out</h1>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 rounded-lg border border-border bg-card p-6 overflow-y-auto space-y-5"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`chat-msg-${m.role}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3 text-sm flex items-center gap-2 rounded-bl-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '0ms'}} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '120ms'}} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '240ms'}} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Say what's on your mind…"
          className="h-12 rounded-full px-5"
          data-testid="chat-input"
        />
        <Button onClick={send} disabled={busy} size="icon" className="h-12 w-12 rounded-full" data-testid="chat-send-btn">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-3">
        Aura is a supportive companion, not a substitute for professional help.
      </p>
    </div>
  );
}
