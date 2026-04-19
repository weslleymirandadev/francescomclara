"use client";

import { Video, BookOpen } from "lucide-react";

export function StoryEditor({
  content,
  onChangeAction,
}: {
  content: any;
  onChangeAction: (newContent: any) => void;
}) {
  const data = content || { videoUrl: "", script: "" };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/"))
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("youtube.com/watch?v="))
      videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const embedUrl = getEmbedUrl(data.videoUrl);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <div className="relative">
          <Video
            className="absolute left-4 top-1/2 -translate-y-1/2 text-s-300"
            size={18}
          />
          <input
            value={data.videoUrl || ""}
            onChange={(e) =>
              onChangeAction({ ...data, videoUrl: e.target.value })
            }
            className="w-full pl-12 pr-4 py-4 bg-s-50 rounded-4xl outline-none font-bold text-s-700 border-2 border-transparent focus:border-s-100 transition-all"
            placeholder="URL do Vídeo da História"
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
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Contexto da Cena (Script)
          </label>
        </div>
        <textarea
          value={data.script || ""}
          onChange={(e) => onChangeAction({ ...data, script: e.target.value })}
          placeholder="O que acontece nessa cena? (Ex: Clara chega ao café e pede um croissant...)"
          className="w-full p-6 bg-blue-50 border border-blue-100 rounded-[24px] text-blue-900 font-medium italic outline-none min-h-[120px] resize-none focus:border-blue-200 transition-all"
        />
        <p className="text-[10px] text-slate-400 ml-2 italic">
          * Este texto aparecerá no destaque azul logo abaixo do vídeo.
        </p>
      </div>
    </div>
  );
}
