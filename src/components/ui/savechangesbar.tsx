"use client";

import { Button } from "@/components/ui/button";

interface SaveChangesBarProps {
  hasChanges: boolean;
  loading: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saveText?: string;
  loadingText?: string;
  message?: string;
}

export function SaveChangesBar({
  hasChanges,
  loading,
  onSave,
  onDiscard,
  saveText = "Salvar Agora",
  loadingText = "A processar...",
  message = "Alterações não salvas"
}: SaveChangesBarProps) {
  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-100 w-[90%] max-w-xl">
      <div className="bg-slate-900 rounded-3xl p-4 shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 pl-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <p className="text-white text-xs font-bold uppercase tracking-widest">
            {message}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={onDiscard}
            disabled={loading}
            className="text-slate-400 hover:text-s-800 text-xs font-bold uppercase h-10 px-4 rounded-xl"
          >
            Descartar
          </Button>
          <Button 
            onClick={onSave}
            disabled={loading}
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase h-10 px-6 rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95"
          >
            {loading ? loadingText : saveText}
          </Button>
        </div>
      </div>
    </div>
  );
}