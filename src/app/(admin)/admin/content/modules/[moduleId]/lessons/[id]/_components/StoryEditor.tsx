"use client";

import { Video, BookOpen, Type } from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";

export function StoryEditor({ content, onChange }: { content: any; onChange: (newContent: any) => void }) {
  const data = content || { videoUrl: "", script: "", description: "" };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("youtube.com/watch?v=")) videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const embedUrl = getEmbedUrl(data.videoUrl);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <div className="relative">
          <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-s-300" size={18} />
          <input 
            value={data.videoUrl || ""}
            onChange={(e) => onChange({ ...data, videoUrl: e.target.value })}
            className="w-full pl-12 pr-4 py-4 bg-s-50 rounded-4xl outline-none font-bold text-s-700"
            placeholder="URL do Vídeo"
          />
        </div>
        {embedUrl && (
          <div className="w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-black border-4 border-white">
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 ml-2">
          <BookOpen size={14} className="text-blue-400" />
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Contexto da Cena</label>
        </div>
        <textarea 
          value={data.script || ""}
          onChange={(e) => onChange({ ...data, script: e.target.value })}
          placeholder="Apenas o contexto curto que aparece no destaque azul..."
          className="w-full p-6 bg-blue-50 border border-blue-100 rounded-[24px] text-blue-900 font-medium italic outline-none min-h-[100px] resize-none"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 ml-2">
          <Type size={14} className="text-s-400" />
          <label className="text-[10px] font-black uppercase tracking-widest text-s-400">Conteúdo Detalhado (Markdown)</label>
        </div>
        <MarkdownEditor 
          id="story-description"
          value={data.description || ""}
          onChange={(val) => onChange({ ...data, description: val })}
          placeholder="Explique a gramática e o vocabulário aqui..."
        />
      </div>
    </div>
  );
}