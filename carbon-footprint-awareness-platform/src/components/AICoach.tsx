import React, { useState, useRef, useEffect } from "react";
import { ActivityLog, DayFootprint } from "../types";
import { MessageSquare, Sparkles, HelpCircle, Send, Plus, ArrowRight, User, Terminal, Leaf } from "lucide-react";

interface AICoachProps {
  activities: ActivityLog[];
  dayFootprints: DayFootprint[];
}

interface ChatMessage {
  role: "user" | "coach";
  text: string;
}

export default function AICoach({ activities, dayFootprints }: AICoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "coach",
      text: "Hello! I am your AI Sustainability Coach. I can analyze your daily activity logs, pinpoint high-impact greenhouse sources, and guide you with personalized recommendations. Ask me anything, or choose a prompt below to get started!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const predefinedPrompts = [
    {
      title: "Diagnose Highest Impact",
      prompt: "Based on my activity logs, what is my highest source of carbon emissions, and what are 3 simple ways I can cut it down?"
    },
    {
      title: "Green Commute Tips",
      prompt: "How can I reduce my transportation carbon emissions if I cannot afford buying an electric vehicle?"
    },
    {
      title: "Sustainable Meals",
      prompt: "Explain how vegetarian or vegan diets compare to beef / meat meals in terms of carbon emission factor impact."
    },
    {
      title: "Standby Wattage Hacks",
      prompt: "What is 'Vampire energy draw' and how much footprint can I save by unplugging standard electronics?"
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError("");
    const userMsg: ChatMessage = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activities: activities.slice(-10), // send last 10 activities for context
          recentFootprints: dayFootprints.slice(-10),
          customPrompt: textToSend,
          chatHistory: messages.map(m => ({
            role: m.role,
            content: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Oops! The AI Coach got occupied. Let's try sending that again!");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: "coach", text: data.response }]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to communicate with the Sustainability Coach.");
    } finally {
      setLoading(false);
    }
  };

  // Bespoke simple markdown-to-JSX parsing helper
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-extrabold text-slate-800 mt-3 mb-1">{line.replace("### ", "")}</h4>;
      }
      // Heading 2
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-extrabold text-slate-800 mt-4 mb-2">{line.replace("## ", "")}</h3>;
      }
      // Bold text blocks formatting
      let formattedLine: React.ReactNode = line;
      if (line.includes("**")) {
        const parts = line.split("**");
        formattedLine = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-emerald-950 bg-emerald-50/40 px-1 rounded">{part}</strong> : part);
      }
      // Bullet items
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="ml-5 list-disc text-slate-600 pl-1 py-0.5 text-xs">
            {formattedLine instanceof Array ? <span className="text-xs">{formattedLine}</span> : (line.substring(2))}
          </li>
        );
      }
      // Non-empty line format
      if (line.trim().length > 0) {
        return <p key={idx} className="text-xs text-slate-650 leading-relaxed mb-2">{formattedLine}</p>;
      }
      // Line break fallback
      return <div key={idx} className="h-2" />;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-h-[80vh]">
      {/* Sidebar tips */}
      <div className="lg:col-span-1 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="bg-emerald-800 p-5 rounded-2xl text-white shadow-sm">
            <div className="bg-emerald-700/60 p-2 rounded-xl inline-block text-emerald-100 mb-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="font-bold text-sm tracking-tight">AI Coach Concept</h3>
            <p className="text-[11px] text-emerald-150 leading-relaxed mt-1">
              Your logs are fed directly into the model context, guaranteeing personalized assessments. Get custom feedback instantly.
            </p>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Suggested Coaching Inquiries
            </span>
            <div className="grid grid-cols-1 gap-2">
              {predefinedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100/50 hover:text-emerald-900 border border-slate-200/60 rounded-xl text-left text-[11px] font-semibold text-slate-600 font-sans transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-2">{p.title}</span>
                  <ArrowRight className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-emerald-800 transition group-hover:translate-x-0.5 ml-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50/70 p-4 rounded-xl border border-dashed border-slate-200/80 text-[10px] text-slate-450 leading-relaxed">
          🔒 Your conversations are private and secured. Real-time data is only loaded temporarily to generate response suggestions.
        </div>
      </div>

      {/* Primary chat window */}
      <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[70vh] lg:h-[650px]">
        {/* Chat header */}
        <div className="bg-slate-50/80 border-b border-slate-100 p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">AI Coach</h3>
            <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Online — Google Gemini 2.5 Active</span>
            </p>
          </div>
        </div>

        {/* Message container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => {
            const isCoach = m.role === "coach";
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${isCoach ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Visual Avatar */}
                <div className={`p-2 rounded-xl h-8 w-8 shrink-0 flex items-center justify-center text-xs font-bold ${
                  isCoach ? "bg-emerald-50 text-emerald-700 border border-emerald-200/30" : "bg-slate-100 text-slate-600"
                }`}>
                  {isCoach ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Speech Bubble */}
                <div className={`p-4 rounded-2xl transition font-sans bubble-chat ${
                  isCoach 
                    ? "bg-slate-50/80 border border-slate-100 text-slate-800 rounded-tl-sm shadow-xs" 
                    : "bg-emerald-900 text-white rounded-tr-sm shadow-md shadow-emerald-990/5 text-xs font-semibold"
                }`}>
                  {isCoach ? (
                    <div>{renderMessageContent(m.text)}</div>
                  ) : (
                    <p className="leading-relaxed text-xs">{m.text}</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Prompting load animations */}
          {loading && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200/30 rounded-xl h-8 w-8 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-xs">
                <div className="flex gap-1 items-center py-1">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing container */}
        <div className="p-4 border-t border-slate-150/60 bg-slate-50/50">
          <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/10 focus-within:border-emerald-600 transition">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
              placeholder="Ask the Sustainability Coach (e.g. 'How can I save electricity?')"
              className="w-full pl-3 pr-10 py-2.5 outline-none text-slate-800 text-xs font-semibold"
              disabled={loading}
            />
            <button
              id="send_ai_query_btn"
              onClick={() => handleSendMessage(inputText)}
              disabled={loading || !inputText.trim()}
              className="absolute right-2 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <span>Ask</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
