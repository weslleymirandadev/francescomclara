'use client';

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { FiPlay, FiCheckCircle, FiChevronRight, FiLock, FiStar } from "react-icons/fi";
import { FaRegClone } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TrackContentProps {
  track: any;
  completedIds: string[];
}

export function TrackContent({ track, completedIds }: TrackContentProps) {
  // Cálculo de progresso da trilha específica
  const totalLessons = track.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedInTrack = track.modules?.reduce((acc: number, m: any) => 
    acc + (m.lessons?.filter((l: any) => completedIds.includes(l.id)).length || 0), 0) || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedInTrack / totalLessons) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER IDÊNTICO AO PAGE.TSX */}
      <header className="mb-12 text-left">
        <div className="flex items-center gap-3 mb-4">
          <span 
            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-opacity-10"
            style={{ 
              backgroundColor: track.objective?.color || '#3b82f6', 
              
            }}
          >
            {track.objective?.name || "Trilha Ativa"}
          </span>
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
          {track.name}
          <span className="text-(--clara-rose)">
            <img src="/static/flower.svg" alt="Flor" className="w-10 h-10 object-contain pointer-events-none" />
          </span>
        </h1>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-bold text-slate-600">Progresso nesta trilha</span>
            <span className="text-lg font-black text-(--interface-accent)">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-linear-to-r from-(--interface-accent) to-[#4D8CD4] rounded-full"
            />
          </div>
        </div>

        {/* BOTÃO DE FLASHCARDS INTEGRADO AO ESTILO */}
        <div className="mt-6">
          <Link href={`/flashcards?trackId=${track.id}`}>
            <Button variant="outline" className="w-full border-slate-200 hover:border-(--interface-accent) text-slate-600 hover:text-(--interface-accent) h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex gap-3 bg-white">
              <FaRegClone size={18} />
              Praticar Flashcards da Trilha
            </Button>
          </Link>
        </div>
      </header>

      {/* LISTAGEM DE MÓDULOS */}
      <section className="space-y-12">
        {track.modules && track.modules.length > 0 ? (
          track.modules.map((module: any, mIdx: number) => (
            <div key={module.id} className="relative">
              <div className="flex items-center gap-4 mb-8 text-left">
                <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="font-bold text-slate-700">{mIdx + 1}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{module.title}</h2>
              </div>

              <div className="grid gap-4">
                {module.lessons?.map((lesson: any) => {
                  const isCompleted = completedIds?.includes(lesson.id) || false;
                  const isLocked = track.isLocked && lesson.isPremium;

                  return (
                    <motion.div
                      key={lesson.id}
                      whileHover={!isLocked ? { x: 5 } : {}}
                      onClick={() => !isLocked && (window.location.href = `/dashboard/aula/${lesson.id}`)}
                      className={`group flex items-center justify-between p-5 rounded-2xl border transition-all ${
                        isLocked 
                          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' 
                          : 'bg-white border-slate-200 shadow-sm hover:border-blue-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCompleted ? 'bg-green-100 text-green-600' : 
                          isLocked ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {isCompleted ? <FiCheckCircle size={20} /> : 
                           isLocked ? <FiLock size={18} /> : <FiPlay size={18} className="ml-1" />}
                        </div>
                        <div>
                          <h3 className={`font-bold ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                            {lesson.title}
                          </h3>
                          {!isLocked && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-medium">15 min • +50 XP</span>
                              {isCompleted && (
                                <div className="flex gap-1">
                                  {[1,2,3].map(s => <FiStar key={s} size={12} className="fill-yellow-400 text-yellow-400" />)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {!isLocked && (
                        <FiChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {mIdx < track.modules.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-slate-200 -z-10" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-20 border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Nenhum conteúdo disponível.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}