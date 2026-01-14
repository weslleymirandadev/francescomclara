"use client";

export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-s-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-interface-accent"></div>
        
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-s-400 animate-pulse">
          Chargement...
        </p>
      </div>
    </div>
  );
}