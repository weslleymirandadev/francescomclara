"use client";

import { FileText } from "lucide-react";

interface ReadingEditorProps {
  content: any;
  onChange: (newContent: any) => void;
}

export function ReadingEditor({ content, onChange }: ReadingEditorProps) {
  const data = content || { text: "" };

  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-s-800">Conteúdo de Leitura</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-s-400">Escreva o texto base da aula</p>
          </div>
        </div>

        <textarea
          value={data.text}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Era uma vez... (Suporta Markdown ou Texto Simples)"
          className="w-full p-8 bg-s-50 border-2 border-transparent focus:border-s-100 focus:bg-white rounded-[40px] font-medium text-s-700 text-lg outline-none transition-all min-h-[500px] resize-none leading-relaxed shadow-inner"
        />
      </div>
    </div>
  );
}