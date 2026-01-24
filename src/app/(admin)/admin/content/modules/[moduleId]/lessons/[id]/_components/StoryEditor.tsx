"use client";

import { Video, BookOpen } from "lucide-react";

interface StoryEditorProps {
  content: any;
  onChange: (newContent: any) => void;
}

export function StoryEditor({ content, onChange }: StoryEditorProps) {
  const data = content || { videoUrl: "", script: "" };

  return (
    <div className="w-full max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-8">
        {/* Link do Vídeo da Story */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-s-400 ml-1">
            Vídeo da Situação Real (URL)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 transition-colors">
              <Video size={20} />
            </div>
            <input 
              type="text"
              value={data.videoUrl}
              onChange={(e) => onChange({ ...data, videoUrl: e.target.value })}
              placeholder="https://vimeo.com/..."
              className="w-full pl-12 pr-4 py-4 bg-s-50 border-2 border-transparent focus:border-(--color-s-100) focus:bg-white rounded-2xl font-bold text-s-700 outline-none transition-all"
            />
          </div>
        </div>

        {/* Script / Diálogo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 ml-1">
            <BookOpen size={14} className="text-s-300" />
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-s-400">
              Script do Diálogo / Vocabulário
            </label>
          </div>
          <textarea 
            value={data.script}
            onChange={(e) => onChange({ ...data, script: e.target.value })}
            placeholder="Transcreva o diálogo ou os pontos chave aqui..."
            className="w-full p-6 bg-s-50 border-2 border-transparent focus:border-(--color-s-100) focus:bg-white rounded-[32px] font-medium text-s-600 outline-none transition-all min-h-[200px] resize-none"
          />
        </div>
      </div>
    </div>
  );
}