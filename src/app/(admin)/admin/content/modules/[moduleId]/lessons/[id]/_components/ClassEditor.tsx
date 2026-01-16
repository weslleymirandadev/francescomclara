"use client";

import { Video } from "lucide-react";

interface ClassEditorProps {
  content: any; // Ajuste conforme sua estrutura de JSON
  onChange: (newContent: any) => void;
}

export function ClassEditor({ content, onChange }: ClassEditorProps) {
  // Exemplo de estrutura: { videoUrl: "", description: "" }
  const data = content || { videoUrl: "", description: "" };

  const updateData = (updates: any) => {
    onChange({ ...data, ...updates });
  };

  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="grid gap-8">
        {/* Campo de Vídeo */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-s-400 ml-1">
            URL do Vídeo (YouTube / Vimeo / Mux)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-s-300 group-focus-within:text-interface-accent transition-colors">
              <Video size={20} />
            </div>
            <input 
              type="text"
              value={data.videoUrl}
              onChange={(e) => updateData({ videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pl-12 pr-4 py-4 bg-s-50 border-2 border-transparent focus:border-s-100 focus:bg-white rounded-2xl font-bold text-s-700 outline-none transition-all"
            />
          </div>
        </div>

        {/* Campo de Teoria / Descrição */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-s-400 ml-1">
            Teoria da Aula
          </label>
          <textarea 
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Explique a teoria desta aula..."
            className="w-full p-6 bg-s-50 border-2 border-transparent focus:border-s-100 focus:bg-white rounded-[32px] font-medium text-s-600 outline-none transition-all min-h-[250px] resize-none"
          />
        </div>
      </div>

      {/* Preview de Vídeo Simples */}
      {data.videoUrl && (
        <div className="pt-4">
          <div className="aspect-video w-full bg-s-900 rounded-[32px] flex items-center justify-center overflow-hidden shadow-2xl">
             <p className="text-white/20 font-black uppercase text-[10px] tracking-widest">Preview do Vídeo</p>
          </div>
        </div>
      )}
    </div>
  );
}