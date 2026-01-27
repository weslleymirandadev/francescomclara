'use client';

import { PlayCircle, ArrowLeft, BookOpen, FileText, Video, CheckCircle2 } from "lucide-react";
import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  const duration = 1.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 25 * (timeLeft / duration);
    
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 150);
};

export function CourseContent({ activeLesson, moduleTitle }: any) {
  if (!activeLesson) return null;

  const isVideo = activeLesson.type === 'CLASS';

  const handleManualComplete = () => {
    triggerConfetti();
    console.log("Lição concluída:", activeLesson.id);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-white relative pt-8">
      {isVideo ? (
        <div className="w-full bg-slate-950 aspect-video flex items-center justify-center relative shrink-0">
          <div className="text-white/20 flex flex-col items-center gap-4">
            <Video size={60} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-widest">Player de Vídeo</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-slate-50 border-b border-slate-100 flex items-center justify-center shrink-0">
           <div className="flex flex-col items-center gap-2">
              <span className="p-4 bg-blue-600/10 rounded-2xl text-blue-600">
                {activeLesson.type === 'STORY' ? <BookOpen size={32}/> : <FileText size={32}/>}
              </span>
              <p className="text-[9px] font-black text-blue-600/40 uppercase tracking-[0.3em]">
                {activeLesson.type === 'STORY' ? 'História e Contexto' : 'Material de Leitura'}
              </p>
           </div>
        </div>
      )}

      <div className="p-12 max-w-4xl mx-auto w-full mb-40">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 block mb-4">
          {moduleTitle}
        </span>
        <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-6">
          {activeLesson.title}
        </h1>
        
        <div 
          className="prose prose-slate max-w-none prose-p:text-lg prose-p:leading-relaxed prose-headings:uppercase prose-headings:font-black"
          dangerouslySetInnerHTML={{ __html: activeLesson.content }} 
        />
      </div>

      {!isVideo && (
        <div className="fixed bottom-0 right-0 left-[380px] p-8 bg-linear-to-t from-white via-white to-transparent flex justify-center z-40">
          <button 
            onClick={handleManualComplete}
            className="group flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-10 h-16 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            <CheckCircle2 size={20} className="group-hover:animate-bounce" />
            Entendi, Clara!
          </button>
        </div>
      )}
    </div>
  );
}