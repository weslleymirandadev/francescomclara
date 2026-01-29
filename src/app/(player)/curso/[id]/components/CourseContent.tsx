'use client';

import { useEffect } from "react";
import { triggerConfetti } from "@/lib/utils";
import Script from "next/script";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function CourseContent({ activeLesson, moduleTitle, onLessonComplete }: any) {
  if (!activeLesson) return null;

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("youtube.com/watch?v=")) videoId = url.split("v=")[1]?.split("&")[0];
    else return url;
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  };

  const content = typeof activeLesson.content === 'string' 
    ? JSON.parse(activeLesson.content) 
    : activeLesson.content;

  const handleComplete = async () => {
    triggerConfetti();
    try {
      await fetch("/api/course/progress", {
        method: "POST",
        body: JSON.stringify({ lessonId: activeLesson.id, completed: true }),
      });

      if (onLessonComplete) {
        onLessonComplete(activeLesson.id);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeLesson.type !== 'CLASS') return;
    
    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      // @ts-ignore
      new window.YT.Player('youtube-player', {
        events: {
          'onStateChange': (event: any) => {
            // @ts-ignore
            if (event.data === window.YT.PlayerState.ENDED) {
              handleComplete();
            }
          }
        }
      });
    };
  }, [activeLesson.id]);

  return (
    <div className="pt-12 md:p-12 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      
      <header className="mb-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
          {moduleTitle}
        </span>
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
          {activeLesson.title}
        </h1>
      </header>
      
      <div className="space-y-8">
        {(activeLesson.type === 'CLASS' || activeLesson.type === 'STORY') && content?.videoUrl && (
          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 shadow-lg">
            <iframe 
              id="youtube-player" 
              src={getEmbedUrl(content.videoUrl)} 
              className="w-full h-full border-0" 
              allowFullScreen 
            />
          </div>
        )}

        {activeLesson.type === 'STORY' && content?.script && (
          <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100 mt-6 wrap-break-word">
            <h4 className="text-[10px] font-black uppercase text-blue-400 mb-2 italic">Contexto da Cena</h4>
            <p className="text-blue-900 font-medium italic">"{content.script}"</p>
          </div>
        )}

        <div className="w-full">
          <div className="text-lg text-slate-600 leading-relaxed wrap-break-word">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({node, ...props}) => <h2 className="text-2xl font-black text-slate-900 mt-8 mb-4 uppercase italic" {...props} />,
                p: ({node, ...props}) => <p className="mb-6 whitespace-pre-wrap" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-6 space-y-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-black text-slate-900" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-600 underline hover:text-blue-800" {...props} />,
              }}
            >
              {content?.description || content?.text || ""}
            </ReactMarkdown>
          </div>
        </div>

          <div className="pt-16 pb-20 flex justify-center border-t border-slate-50 mt-12">
            <button 
              onClick={handleComplete}
              className="group flex items-center gap-3 bg-slate-900 hover:bg-emerald-600 text-white px-8 h-14 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
            >
              <span className="text-[11px] font-black uppercase tracking-widest">
                Entendi, Clara!
              </span>
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </button>
          </div>
      </div>
    </div>
  );
}