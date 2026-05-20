"use client";

import { Bot, Sparkles, Send, User as UserIcon, Plus, History, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useAppContext, ChatSession } from "@/lib/store";

export default function AssistentePage() {
  const {
    proposals,
    chatSessions,
    activeChatId,
    newChat,
    selectChat,
    addMessageToActiveChat,
    getActiveSession,
  } = useAppContext();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = getActiveSession();

  // Create a new chat if none exists when landing on this page
  useEffect(() => {
    if (!activeChatId || !chatSessions.find(s => s.id === activeChatId)) {
      newChat();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  const handleSend = () => {
    if (!input.trim() || !activeSession) return;

    const userMsg = input.trim();
    addMessageToActiveChat({ role: 'user', content: userMsg });
    setInput("");

    // Simple Mock AI Logic
    setTimeout(() => {
      let response = "Desculpe, ainda estou aprendendo a processar essa solicitação específica. Posso te contar que temos um total de " + proposals.length + " propostas no sistema atualmente!";

      const lower = userMsg.toLowerCase();
      if (lower.includes("proposta") || lower.includes("quantos") || lower.includes("total")) {
        response = `Atualmente temos ${proposals.length} propostas ativas sincronizadas do Pipefy.`;
      } else if (lower.includes("comitê") || lower.includes("comite")) {
        const inComite = proposals.filter(p => p.currentPhase.includes("Comitê")).length;
        response = `Existem ${inComite} propostas aguardando ou em fase de comitê no momento.`;
      } else if (lower.includes("alto risco") || lower.includes("perigo")) {
        const highRisk = proposals.filter(p => p.cannibalizationRisk === 'alto').length;
        response = `Identifiquei ${highRisk} propostas com alto risco de canibalização que requerem sua atenção urgente.`;
      }

      addMessageToActiveChat({ role: 'ai', content: response });
    }, 600);
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      
      {/* Sidebar de Histórico */}
      <div className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => newChat()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            Conversas
          </p>
          {chatSessions.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">Nenhuma conversa ainda.</p>
          ) : (
            chatSessions.map(session => (
              <button
                key={session.id}
                onClick={() => selectChat(session.id)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors cursor-pointer ${
                  session.id === activeChatId
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p className="font-medium truncate">{session.title}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  {new Date(session.createdAt).toLocaleDateString('pt-BR')} · {session.messages.length} msgs
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Assistente de Projetos (IA)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Integrado com dados reais do Pipefy</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full gap-1 border border-blue-100 dark:border-blue-800 font-medium">
            <Sparkles className="w-3 h-3" /> IA Ativada
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50 dark:bg-slate-900">
          {activeSession?.messages.map((m, idx) => (
            <div key={idx} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'ai' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                {m.role === 'ai' ? <Bot className="w-4 h-4 text-white" /> : <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              </div>
              <div className={`p-4 border shadow-sm max-w-[80%] rounded-2xl text-sm leading-relaxed ${m.role === 'ai' ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-tl-sm' : 'bg-blue-600 text-white border-blue-700 rounded-tr-sm'}`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <div className="relative">
            <Input
              placeholder="Pergunte sobre propostas, riscos ou status..."
              className="pr-12 py-6 rounded-full shadow-sm bg-slate-50 dark:bg-slate-900 focus-visible:ring-blue-600"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 ml-[-2px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
