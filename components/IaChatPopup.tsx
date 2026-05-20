"use client";

import { useAppContext, ChatMessage } from "@/lib/store";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minus, Maximize2, Plus, History, ChevronLeft, Sparkles, Trash2 } from "lucide-react";

export function IaChatPopup() {
  const {
    proposals,
    isPopupOpen,
    isPopupMinimized,
    closeChatPopup,
    minimizePopup,
    restorePopup,
    chatSessions,
    activeChatId,
    newChat,
    selectChat,
    addMessageToActiveChat,
    getActiveSession,
    deleteChat,
  } = useAppContext();

  const pathname = usePathname();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = getActiveSession();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  // Build page context label
  const getPageContext = (): string => {
    if (pathname.startsWith("/propostas/")) {
      const id = pathname.split("/").pop();
      const prop = proposals.find(p => p.id === id);
      return prop ? `📄 ${prop.courseName}` : "📄 Proposta";
    }
    if (pathname.startsWith("/coordenadores/")) return "👤 Coordenador";
    if (pathname === "/pipeline") return "📊 Pipeline";
    if (pathname === "/") return "🏠 Dashboard";
    if (pathname === "/busca") return "🔍 Busca Avançada";
    if (pathname === "/feedbacks") return "💬 Feedbacks";
    return "";
  };

  const handleSend = () => {
    if (!input.trim() || !activeSession) return;

    const userMsg = input.trim();
    addMessageToActiveChat({ role: 'user', content: userMsg });
    setInput("");

    // Mock AI logic with page context
    setTimeout(() => {
      let response = `Desculpe, ainda estou aprendendo. Temos ${proposals.length} propostas no sistema.`;

      const lower = userMsg.toLowerCase();
      const pageCtx = getPageContext();

      if (pathname.startsWith("/propostas/")) {
        const id = pathname.split("/").pop();
        const prop = proposals.find(p => p.id === id);
        if (prop) {
          if (lower.includes("resumo") || lower.includes("objetivo")) {
            response = `**${prop.courseName}**\n\nCoordenador: ${prop.coordinator}\nFase atual: ${prop.currentPhase}\nRisco de canibalização: ${prop.cannibalizationRisk}\n\nEsta proposta está na fase "${prop.currentPhase}".`;
          } else if (lower.includes("risco") || lower.includes("canibalização")) {
            response = `O risco de canibalização desta proposta (${prop.courseName}) é **${prop.cannibalizationRisk}**.`;
          } else {
            response = `Estou analisando a proposta "${prop.courseName}". Posso te dar um resumo, informações sobre risco ou detalhes do coordenador. O que deseja?`;
          }
        }
      } else if (lower.includes("proposta") || lower.includes("quantos") || lower.includes("total")) {
        response = `Atualmente temos ${proposals.length} propostas ativas no sistema.`;
      } else if (lower.includes("comitê") || lower.includes("comite")) {
        const inComite = proposals.filter(p => p.currentPhase.includes("Comitê")).length;
        response = `Existem ${inComite} propostas aguardando ou em fase de comitê.`;
      } else if (lower.includes("alto risco") || lower.includes("perigo")) {
        const highRisk = proposals.filter(p => p.cannibalizationRisk === 'alto').length;
        response = `Identifiquei ${highRisk} propostas com alto risco de canibalização.`;
      }

      addMessageToActiveChat({ role: 'ai', content: response });
    }, 600);
  };

  const handleMaximize = () => {
    closeChatPopup();
    router.push("/ia");
  };

  const handleNewChat = () => {
    newChat();
    setShowHistory(false);
  };

  if (!isPopupOpen) return null;

  // Minimized state
  if (isPopupMinimized) {
    return (
      <button
        onClick={restorePopup}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center hover:scale-110 cursor-pointer animate-in zoom-in-50 duration-200"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  const pageContext = getPageContext();

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[560px] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
      {/* Header */}
      <div className="p-3 bg-blue-600 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Assistente IA</h3>
            {pageContext && (
              <p className="text-[11px] text-blue-200 truncate max-w-[200px]">{pageContext}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={minimizePopup} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer" title="Minimizar">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={handleMaximize} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer" title="Tela cheia">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={closeChatPopup} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer" title="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
          <History className="w-3.5 h-3.5" />
          Histórico
        </button>
        <button onClick={handleNewChat} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          Novo Chat
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* History Panel */}
        {showHistory && (
          <div className="absolute inset-0 z-10 bg-white dark:bg-slate-800 flex flex-col animate-in slide-in-from-left-4 duration-200">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Conversas Anteriores</h4>
              <button onClick={() => setShowHistory(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {chatSessions.length === 0 ? (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">Nenhuma conversa ainda.</p>
              ) : (
                chatSessions.map(session => (
                  <div
                    key={session.id}
                    className={`flex items-center gap-1 rounded-lg transition-colors ${
                      session.id === activeChatId
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => { selectChat(session.id); setShowHistory(false); }}
                      className={`flex-1 text-left p-3 text-sm ${
                        session.id === activeChatId
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300'
                      } cursor-pointer`}
                    >
                      <p className="font-medium truncate">{session.title}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(session.createdAt).toLocaleDateString('pt-BR')} &middot; {session.messages.length} msgs
                      </p>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }}
                      className="p-2 mr-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                      title="Excluir conversa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeSession?.messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'ai' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                {m.role === 'ai' ? <Bot className="w-3.5 h-3.5 text-white" /> : <Sparkles className="w-3.5 h-3.5 text-slate-600 dark:text-slate-200" />}
              </div>
              <div className={`px-3.5 py-2.5 max-w-[80%] rounded-2xl text-sm leading-relaxed ${
                m.role === 'ai'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                  : 'bg-blue-600 text-white rounded-tr-sm'
              }`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Pergunte algo..."
            className="w-full pr-10 pl-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 ml-[-1px]" />
          </button>
        </div>
      </form>
    </div>
  );
}
