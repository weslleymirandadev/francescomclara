"use client";

import { Video, Type } from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";

export function ClassEditor({ content, onChange }: { content: any; onChange: (newContent: any) => void }) {
  const data = content || { videoUrl: "", description: "" };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("youtube.com/watch?v=")) videoId = url.split("v=")[1]?.split("&")[0];
    else return url;
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
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
            placeholder="URL do Vídeo do Aluno"
            className="w-full pl-12 pr-4 py-4 bg-s-50 rounded-4xl outline-none font-bold text-s-700 border-2 border-transparent focus:border-s-100 transition-all"
          />
        </div>

        {embedUrl && (
          <div className="w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl border-8 border-white bg-black">
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 ml-2">
          <Type size={14} className="text-s-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-s-400">Conteúdo Teórico</span>
        </div>
        <MarkdownEditor 
          id="class-theory"
          value={data.description}
          onChange={(val) => onChange({ ...data, description: val })}
          placeholder="Escreva a teoria aqui..."
        />
      </div>
    </div>
  );
}