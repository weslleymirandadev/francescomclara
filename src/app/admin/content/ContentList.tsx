"use client";

import { useState, useTransition } from "react";
import { createLessonAction, deleteTrackAction, deleteModuleAction, deleteLessonAction, createTrackAction, createModuleAction } from "./actions";
import { 
  Plus, GripVertical, ChevronDown, ChevronRight,
  Video, FileText, Layers, MoreVertical, Layout, Award, Trash2
} from "lucide-react";

interface ContentListProps {
  tracks: {
    id: string;
    name: string;
    modules: {
      id: string;
      title: string;
      cefrLevel: any; // Ou o enum correto do seu Prisma
      lessons: {
        id: string;
        title: string;
        type: any;
      }[];
    }[];
  }[];
}

export default function ContentList({ tracks }: ContentListProps) {
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    const handleAddLesson = (moduleId: string) => {
        startTransition(async () => {
        await createLessonAction(moduleId);
        });
    };

    const handleAction = (fn: () => Promise<void>) => {
        startTransition(async () => {
        await fn();
        });
    };

    const toggleModule = (id: string) => {
        setExpandedModules(prev => 
        prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
      <header className="flex justify-between items-end border-b border-s-100 pb-6 rounded-xl">
        <div className="ml-4 p-2">
          <h1 className="text-3xl text-s-800 font-bold uppercase tracking-tighter leading-none">Arquitetura de Conteúdo</h1>
          <p className="text-s-500 text-sm font-bold italic mt-2">Trilha → Módulo → Aula 🌸</p>
        </div>
        <button 
          disabled={isPending}
          onClick={() => handleAction(() => createTrackAction())}
          className="bg-s-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-interface-accent transition-all disabled:opacity-50"
        >
          <Plus size={16} /> {isPending ? "A criar..." : "Nova Trilha"}
        </button>
      </header>

      {tracks?.map((track) => (
        <div key={track.id} className="space-y-6">
          {/* NÍVEL 1: TRILHA (Card Principal) */}
          <div className="flex items-center justify-between bg-white border border-s-100 p-5 rounded-2xl shadow-sm m-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-s-900 text-white rounded-xl flex items-center justify-center">
                <Layout size={20} />
              </div>
              <h2 className="font-black text-s-800 uppercase text-base tracking-tight">{track.name}</h2>
            </div>
            <div className="flex items-center gap-4">
              {/* BOTÃO DELETAR TRILHA */}
              <button 
                onClick={() => {
                  if(confirm("Tens a certeza? Isto vai apagar todos os módulos e aulas desta trilha!"))
                    handleAction(() => deleteTrackAction(track.id))
                }}
                className="opacity-40 group-hover:opacity-100 p-2 text-s-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
              <button className="text-[10px] font-black text-s-400 uppercase tracking-widest hover:text-interface-accent">Configurações</button>
            </div>
          </div>

          {/* O "FIO CONDUTOR" DA ÁRVORE */}
          <div className="relative ml-10 pl-8 border-l-2 border-s-100 space-y-6 pt-10">
            
            {track.modules.map((module) => (
              <div key={module.id} className="relative">
                {/* Conector Horizontal do Módulo */}
                <div className="absolute -left-[34px] top-7 w-8 border-t-2 border-s-100" />

                {/* NÍVEL 2: MÓDULO */}
                <div className="bg-white border border-s-100 rounded-2xl overflow-hidden">
                  <div 
                    onClick={() => toggleModule(module.id)}
                    className="flex items-center justify-between p-4 px-6 cursor-pointer hover:bg-s-50/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <GripVertical size={16} className="text-s-200" />
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-s-800 text-sm">{module.title}</h3>
                        {/* CEFR Level Badge - Integrado com o Enum do Schema */}
                        {module.cefrLevel && (
                          <span className="flex items-center gap-1 bg-s-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            <Award size={10} /> {module.cefrLevel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-s-300 uppercase">{module.lessons.length} aulas</span>
                      {expandedModules.includes(module.id) ? <ChevronDown size={18} className="text-s-400" /> : <ChevronRight size={18} className="text-s-400" />}
                    </div>
                  </div>

                  {/* NÍVEL 3: AULAS (Aninhadas) */}
                  {expandedModules.includes(module.id) && (
                    <div className="p-4 pt-0 space-y-2">
                      <div className="ml-4 pl-6 border-l border-s-50 space-y-2 pb-2">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="relative flex items-center justify-between bg-s-50/30 p-3 rounded-xl border border-transparent hover:border-s-50 hover:bg-white transition-all group">
                            {/* Conector Horizontal da Aula */}
                            <div className="absolute -left-[25px] top-1/2 w-6 border-t border-s-50" />
                            
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                 {lesson.type === 'CLASS' && <Video size={14} className="text-blue-500" />}
                                 {lesson.type === 'FLASHCARD' && <Layers size={14} className="text-emerald-500" />}
                                 {lesson.type === 'READING' && <FileText size={14} className="text-amber-500" />}
                              </div>
                              <span className="text-sm font-bold text-s-700">{lesson.title}</span>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-s-100 rounded-lg transition-all">
                              <MoreVertical size={16} className="text-s-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button 
                        disabled={isPending}
                        onClick={() => handleAddLesson(module.id)}
                        className={`ml-10 w-[calc(100%-2.5rem)] py-2 border-2 border-dashed rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 
                        ${isPending ? 'opacity-50 cursor-not-allowed' : 'text-s-400 hover:text-interface-accent hover:border-interface-accent/30'}`}
                    >
                        <Plus size={14} /> {isPending ? 'Criando...' : 'Adicionar Aula'}
                    </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}