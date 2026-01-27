'use client';

import { ChevronDown, ChevronRight, Video, BookOpen, FileText, BrainCircuit, CheckCircle2 } from "lucide-react";

export function CourseSidebar({ data, activeLesson, setActiveLesson, openModules, toggleModule }: any) {
  
  const getLessonIcon = (type: string, isActive: boolean) => {
    const props = { size: 14, className: isActive ? "text-white" : "text-slate-500" };
    switch (type) {
      case 'CLASS': return <Video {...props} />;
      case 'STORY': return <BookOpen {...props} />;
      case 'READING': return <FileText {...props} />;
      case 'FLASHCARD': return <BrainCircuit {...props} />;
      default: return <Video {...props} />;
    }
  };

  return (
    <aside className="fixed left-0 top-0 w-[380px] h-screen border-r border-slate-100 bg-white flex flex-col z-50 overflow-hidden">
      <div className="p-8 border-b border-slate-50 shrink-0">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Curso:</h2>
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-tight italic">
          {data?.name}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 custom-scrollbar">
        {data?.modules?.map((module: any) => (
          <div key={module.id} className="space-y-1">
            <button 
              onClick={() => toggleModule(module.id)}
              className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all border ${
                openModules.includes(module.id) ? 'bg-white border-slate-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-100'
              }`}
            >
              <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-tight">{module.title}</h4>
              {openModules.includes(module.id) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>

            {openModules.includes(module.id) && (
              <div className="mt-1 space-y-1 px-2">
                {module.lessons?.map((lesson: any) => {
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                        isActive ? 'bg-slate-900 text-white shadow-xl' : 'hover:bg-white text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-blue-600' : 'bg-slate-100'
                      }`}>
                        {getLessonIcon(lesson.type, isActive)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}