import { prisma } from "@/lib/prisma";
import { ChevronLeft, Save, Video, Layout, Layers, FileText, Settings2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ moduleId: string; id: string }>;
}

export default async function LessonEditPage({ params }: PageProps) {
  const { moduleId, id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: id }
  });

  if (!lesson) {
    return <div className="p-10 text-s-500 font-bold italic text-center">Aula não encontrada 🌸</div>;
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER LIMPO - SEM BORDAS E COM HIERARQUIA */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href={`/admin/content/modules/${moduleId}`} className="p-3 hover:bg-s-50 rounded-2xl transition-all text-s-400">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl text-s-800 font-black uppercase tracking-tighter leading-none">Editar Aula</h1>
              <p className="text-s-400 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                {lesson.title} <span className="text-s-200">|</span> <span className="text-interface-accent">{lesson.type}</span>
              </p>
            </div>
          </div>
          <button className="bg-s-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-s-900/20">
            <Save size={18} /> Salvar Alterações
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* PAINEL LATERAL: CONFIGS DA AULA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-s-50/50 p-8 rounded-[32px] space-y-8">
              <div className="flex items-center gap-3">
                <Settings2 size={20} className="text-s-300" />
                <h2 className="text-sm font-black uppercase text-s-800 tracking-tight">Configurações</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-s-400 ml-1">Tipo de Conteúdo</label>
                  <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm w-fit">
                    <div className={`p-3 rounded-xl transition-all ${lesson.type === 'CLASS' ? 'bg-s-900 text-white shadow-md' : 'text-s-200'}`}>
                      <Video size={20} />
                    </div>
                    <div className={`p-3 rounded-xl transition-all ${lesson.type === 'READING' ? 'bg-s-900 text-white shadow-md' : 'text-s-200'}`}>
                      <FileText size={20} />
                    </div>
                    <div className={`p-3 rounded-xl transition-all ${lesson.type === 'FLASHCARD' ? 'bg-s-900 text-white shadow-md' : 'text-s-200'}`}>
                      <Layers size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-s-400 ml-1">Título da Aula</label>
                  <input 
                    type="text" 
                    defaultValue={lesson.title}
                    className="w-full p-4 bg-white border-none rounded-2xl font-bold text-s-700 shadow-sm focus:ring-2 focus:ring-interface-accent/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* EDITOR PRINCIPAL */}
          <div className="lg:col-span-8">
            <div className="bg-white border-2 border-dashed border-s-100 min-h-[600px] rounded-[40px] p-12 flex flex-col items-center justify-center text-center space-y-6 transition-all hover:border-s-200">
              <div className="w-20 h-20 bg-s-50 rounded-[28px] flex items-center justify-center text-s-100">
                <Layout size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-s-800 uppercase tracking-tighter">Editor de Conteúdo</h3>
                <p className="text-s-400 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto opacity-60">
                  Configure os dados para {lesson.type}
                </p>
              </div>
              <div className="pt-4">
                <button className="px-6 py-2 rounded-full border border-s-100 text-[10px] font-black uppercase text-s-300 hover:text-s-800 hover:border-s-800 transition-all">
                  Abrir Construtor
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}