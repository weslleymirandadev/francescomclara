import { prisma } from "@/lib/prisma";
import { Lesson } from "@prisma/client";
import { 
  ChevronLeft, Save, Video, 
  Layers, FileText, GripVertical, Settings2
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function ModuleEditPage({ params }: PageProps) {
  const { moduleId } = await params;

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { lessons: { orderBy: { order: 'asc' } } }
  });

  if (!module) return <div className="p-10 text-s-500 font-bold italic text-center">Módulo não encontrado 🌸</div>;

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER LIMPO */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin/content" className="p-3 hover:bg-s-50 rounded-2xl transition-all text-s-400">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl text-s-800 font-black uppercase tracking-tighter leading-none">Editar Módulo</h1>
              <p className="text-s-400 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                {module.title} <span className="text-s-200">|</span> <span className="text-interface-accent">{module.cefrLevel}</span>
              </p>
            </div>
          </div>
          <button className="bg-s-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-s-900/20">
            <Save size={18} /> Salvar Módulo
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* PAINEL DE PROPRIEDADES (ESQUERDA) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-s-50/50 p-8 rounded-[32px] space-y-8">
              <div className="flex items-center gap-3">
                <Settings2 size={20} className="text-s-300" />
                <h2 className="text-sm font-black uppercase text-s-800 tracking-tight">Propriedades</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-s-400 ml-1">Título do Módulo</label>
                  <input 
                    type="text" 
                    defaultValue={module.title}
                    className="w-full p-4 bg-white border-none rounded-2xl font-bold text-s-700 shadow-sm focus:ring-2 focus:ring-interface-accent/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-s-400 ml-1">Nível CEFR</label>
                  <select 
                    defaultValue={module.cefrLevel || "A1"}
                    className="w-full p-4 bg-white border-none rounded-2xl font-bold text-s-700 shadow-sm outline-none appearance-none cursor-pointer"
                  >
                    <option value="A1">A1 - Iniciante</option>
                    <option value="B1">B1 - Intermédio</option>
                    <option value="C1">C1 - Avançado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* LISTA DE AULAS (DIREITA) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-end px-4">
              <h2 className="text-lg font-black uppercase text-s-800 tracking-tighter">
                Aulas deste Módulo <span className="text-s-300 ml-1">({module.lessons.length})</span>
              </h2>
            </div>

            <div className="space-y-4">
              {module.lessons.map((lesson: Lesson) => (
                <Link 
                  key={lesson.id}
                  href={`/admin/content/modules/${module.id}/lessons/${lesson.id}`}
                  className="flex items-center justify-between bg-white p-6 rounded-[24px] shadow-sm hover:shadow-md hover:scale-[1.01] transition-all group border border-transparent hover:border-s-50"
                >
                  <div className="flex items-center gap-6">
                    <GripVertical size={20} className="text-s-100 group-hover:text-s-300 transition-colors" />
                    <div className="w-12 h-12 rounded-2xl bg-s-50 flex items-center justify-center group-hover:bg-interface-accent/10 transition-colors">
                      {lesson.type === 'CLASS' && <Video size={22} className="text-blue-500" />}
                      {lesson.type === 'READING' && <FileText size={22} className="text-amber-500" />}
                      {lesson.type === 'FLASHCARD' && <Layers size={22} className="text-emerald-500" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-s-800 text-lg leading-tight group-hover:text-interface-accent transition-colors">
                        {lesson.title}
                      </h3>
                      <span className="text-[10px] font-black text-s-300 uppercase tracking-widest">{lesson.type}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-s-200 group-hover:text-s-800 transition-all">
                    <ChevronLeft size={20} className="rotate-180" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}