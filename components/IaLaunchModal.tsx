"use client";

import { useAppContext } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Bot, Maximize2, MessageCircle, X } from "lucide-react";

export function IaLaunchModal() {
  const { isLaunchModalOpen, closeLaunchModal, openChatPopup } = useAppContext();
  const router = useRouter();

  if (!isLaunchModalOpen) return null;

  const handleFullscreen = () => {
    closeLaunchModal();
    router.push("/ia");
  };

  const handlePopup = () => {
    closeLaunchModal();
    openChatPopup();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={closeLaunchModal}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Assistente IA</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Como deseja abrir o assistente?</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
              IA Inativa
            </span>
            <button onClick={closeLaunchModal} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleFullscreen}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
              <Maximize2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Tela Cheia</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Abrir em página dedicada</p>
            </div>
          </button>

          <button
            onClick={handlePopup}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Popup</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ficar na tela atual</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
