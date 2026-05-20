"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, User, Send, Sparkles, RefreshCw } from "lucide-react";

interface Message {
 id: string;
 role: "assistant" | "user";
 content: string;
 timestamp: Date;
}

const MOCK_RESPONSES: Record<string, string> = {
 default:
 "Entendido! Com base nos dados das propostas YMed, posso ajudar você a analisar tendências, identificar gargalos no pipeline e sugerir prioridades. O que mais gostaria de saber?",
 propostas:
 "Atualmente há 6 propostas ativas no portfólio YMed. Dentre elas, 1 está aprovada (Medicina Esportiva — Alano), 3 estão em análise e 2 estão recebendo proposta. A fase com mais propostas é 'Solicitações'.",
 comite:
 "Há 1 proposta na fase de Comitê: 'Gastroenterologia Prática', coordenada por IJR, na área de Gastroenterologia. Ela está em análise desde dezembro de 2025 e aguarda deliberação.",
 coordenador:
 "Os coordenadores ativos são: INSBE (2 propostas), Alano (2 propostas), ILHHH (1 proposta) e IJR (1 proposta). INSBE e Alano lideram em volume de solicitações.",
 aprovadas:
 "A única proposta aprovada até o momento é 'Medicina Esportiva', coordenada por Alano. Ela passou por todas as fases e foi aprovada em abril de 2026.",
 pipeline:
 "O pipeline YMed possui 9 fases: Solicitações, Revisão, Aguardando aprovação, Pré-Comitê, Aguardando Comitê, Comitê, Stand By, Propostas Aprovadas e Reprovados. Atualmente as propostas estão distribuídas principalmente nas fases iniciais.",
 ia:
 "Sou o assistente de IA do YMed! Posso ajudar com análise de propostas, identificar padrões no portfólio, sugerir ações estratégicas e responder dúvidas sobre o fluxo de aprovação de cursos médicos.",
};

function getMockResponse(input: string): string {
 const lower = input.toLowerCase();
 if (lower.includes("proposta") || lower.includes("quantas")) return MOCK_RESPONSES.propostas;
 if (lower.includes("comit")) return MOCK_RESPONSES.comite;
 if (lower.includes("coordenador") || lower.includes("insbe") || lower.includes("alano")) return MOCK_RESPONSES.coordenador;
 if (lower.includes("aprovad")) return MOCK_RESPONSES.aprovadas;
 if (lower.includes("pipeline") || lower.includes("fase") || lower.includes("fluxo")) return MOCK_RESPONSES.pipeline;
 if (lower.includes("ia") || lower.includes("assistente") || lower.includes("você") || lower.includes("quem")) return MOCK_RESPONSES.ia;
 return MOCK_RESPONSES.default;
}

const WELCOME: Message = {
 id: "welcome",
 role: "assistant",
 content:
 "Olá! 👋 Sou o **YMed AI**, seu assistente de inteligência artificial para o portfólio de cursos médicos. Posso te ajudar a:\n\n• Analisar o status das propostas\n• Identificar gargalos no pipeline\n• Resumir informações por coordenador\n• Sugerir prioridades estratégicas\n\nComo posso te ajudar hoje?",
 timestamp: new Date(),
};

const SUGGESTIONS = [
 "Quantas propostas estão em análise?",
 "Quem tem mais propostas?",
 "O que está no comitê?",
 "Me explique o pipeline YMed",
];

function ChatBubble({ msg }: { msg: Message }) {
 const isUser = msg.role === "user";
 return (
 <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
 {/* Avatar */}
 <div
 className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
 isUser
 ? "bg-rose-600 text-white"
 : "bg-gradient-to-br from-rose-500 to-rose-700 text-white"
 }`}
 >
 {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
 </div>

 {/* Bubble */}
 <div
 className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
 isUser
 ? "bg-rose-600 text-white rounded-tr-sm"
 : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm"
 }`}
 >
 <p className="whitespace-pre-wrap">{msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
 <p className={`text-[10px] mt-1.5 ${isUser ? "text-rose-200" : "text-slate-400"}`}>
 {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
 </p>
 </div>
 </div>
 );
}

export default function YmedIaPage() {
 const [messages, setMessages] = useState<Message[]>([WELCOME]);
 const [input, setInput] = useState("");
 const [loading, setLoading] = useState(false);
 const bottomRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 function sendMessage(text?: string) {
 const value = text ?? input;
 if (!value.trim() || loading) return;
 setInput("");

 const userMsg: Message = {
 id: Date.now().toString(),
 role: "user",
 content: value.trim(),
 timestamp: new Date(),
 };
 setMessages((prev) => [...prev, userMsg]);
 setLoading(true);

 setTimeout(() => {
 const aiMsg: Message = {
 id: (Date.now() + 1).toString(),
 role: "assistant",
 content: getMockResponse(value),
 timestamp: new Date(),
 };
 setMessages((prev) => [...prev, aiMsg]);
 setLoading(false);
 }, 900 + Math.random() * 600);
 }

 function resetChat() {
 setMessages([WELCOME]);
 setInput("");
 }

 return (
 <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
 {/* Header */}
 <div className="flex items-center justify-between mb-4 shrink-0">
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Sparkles className="w-6 h-6 text-rose-600" />
 YMed AI
 </h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Assistente de inteligência artificial para o portfólio médico
 </p>
 </div>
 <button
 onClick={resetChat}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors"
 >
 <RefreshCw className="w-3.5 h-3.5" />
 Nova conversa
 </button>
 </div>

 {/* Chat area */}
 <Card className="flex-1 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
 {/* Messages */}
 <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-slate-800/50/50">
 {messages.map((msg) => (
 <ChatBubble key={msg.id} msg={msg} />
 ))}

 {/* Loading bubble */}
 {loading && (
 <div className="flex gap-3">
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center shrink-0 shadow-sm">
 <Bot className="w-4 h-4" />
 </div>
 <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
 <div className="flex gap-1.5 items-center h-5">
 <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:0ms]" />
 <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:150ms]" />
 <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:300ms]" />
 </div>
 </div>
 </div>
 )}
 <div ref={bottomRef} />
 </div>

 {/* Suggestions */}
 {messages.length <= 1 && (
 <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2 flex-wrap">
 {SUGGESTIONS.map((s) => (
 <button
 key={s}
 onClick={() => sendMessage(s)}
 className="px-3 py-1.5 rounded-full border border-rose-200 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors font-medium"
 >
 {s}
 </button>
 ))}
 </div>
 )}

 {/* Input */}
 <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-3">
 <Input
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter" && !e.shiftKey) {
 e.preventDefault();
 sendMessage();
 }
 }}
 placeholder="Pergunte sobre propostas, coordenadores, pipeline..."
 className="flex-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-rose-400 text-sm"
 disabled={loading}
 />
 <Button
 onClick={() => sendMessage()}
 disabled={loading || !input.trim()}
 className="h-10 w-10 p-0 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shrink-0 disabled:opacity-40"
 >
 <Send className="w-4 h-4" />
 </Button>
 </div>
 </Card>
 </div>
 );
}
