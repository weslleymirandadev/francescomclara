"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlay, FiCheckCircle, FiLock, FiStar, FiChevronRight } from "react-icons/fi";

type Lesson = {
  id: string;
  title: string;
  completed: boolean;
  locked: boolean;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Track = {
  id: string;
  name: string;
  progress: number;
  modules: Module[];
};

export default function MyTrackPage() {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrackData() {
      try {
        const trackId = "trilha-viagem"; 
        const response = await fetch(`/api/tracks/${trackId}`);
        
        if (!response.ok) throw new Error("Falha ao buscar trilha");
        
        const data = await response.json();
        setTrack(data);
      } catch (error) {
        console.error("Erro ao carregar dados do Prisma:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTrackData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-s-50)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--clara-rose)]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-100 text-[var(--interface-accent)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Trilha Ativa
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-[var(--color-s-900)] mb-6">
            {track?.name} <span className="text-[var(--clara-rose)]">🌸</span>
          </h1>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[var(--color-s-200)]">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-bold text-[var(--color-s-600)]">O seu progresso total</span>
              <span className="text-lg font-black text-[var(--interface-accent)]">{track?.progress}%</span>
            </div>
            <div className="h-3 w-full bg-[var(--color-s-100)] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${track?.progress}%` }}
                className="h-full bg-gradient-to-r from-[var(--interface-accent)] to-[#4D8CD4] rounded-full"
              />
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {track?.modules.map((module, mIdx) => (
            <div key={module.id} className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white border-2 border-[var(--color-s-200)] rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="font-bold text-[var(--color-s-700)]">{mIdx + 1}</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--color-s-800)]">{module.title}</h2>
              </div>

              <div className="grid gap-4">
                {module.lessons.map((lesson) => (
                  <motion.div 
                    key={lesson.id}
                    whileHover={!lesson.locked ? { x: 5 } : {}}
                    className={`group flex items-center justify-between p-5 rounded-2xl border transition-all ${
                      lesson.locked 
                        ? 'bg-[var(--color-s-100)] border-[var(--color-s-200)] opacity-60' 
                        : 'bg-white border-[var(--color-s-200)] shadow-sm hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        lesson.completed ? 'bg-green-100 text-green-600' : 
                        lesson.locked ? 'bg-[var(--color-s-200)] text-[var(--color-s-400)]' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {lesson.completed ? <FiCheckCircle size={20} /> : 
                         lesson.locked ? <FiLock size={18} /> : <FiPlay size={18} className="ml-1" />}
                      </div>
                      <div>
                        <h3 className={`font-bold ${lesson.locked ? 'text-[var(--color-s-50)]0' : 'text-[var(--color-s-800)]'}`}>
                          {lesson.title}
                        </h3>
                        {!lesson.locked && (
                          <span className="text-xs text-[var(--color-s-400)] font-medium">10-15 min • +50 XP</span>
                        )}
                      </div>
                    </div>

                    {!lesson.locked && (
                      <div className="flex items-center gap-2">
                        {lesson.completed && (
                          <div className="flex gap-1 mr-4">
                            {[1,2,3].map(s => <FiStar key={s} size={12} className="fill-yellow-400 text-yellow-400" />)}
                          </div>
                        )}
                        <FiChevronRight className="text-[var(--color-s-300)] group-hover:text-blue-500 transition-colors" size={20} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {mIdx < track.modules.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-[var(--color-s-200)] -z-10" />
              )}
            </div>
          ))}
        </section>

      </div>
    </main>
  );
}