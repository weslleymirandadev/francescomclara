"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiHelpCircle, FiBook } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";

interface Lesson {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Track {
  id: string;
  modules: Module[];
}

interface ContentResponse {
  tracks: Track[];
  plans: any[];
}

export default function NewTopicPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<{id: string, title: string}[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    lessonId: ""
  });

  useEffect(() => {
    fetch("/api/public/content")
      .then(res => res.json())
      .then((data: ContentResponse) => {
        const allLessons = data.tracks.flatMap((track) => 
          track.modules.flatMap((mod) => 
            mod.lessons.map((lesson) => ({
              id: lesson.id,
              title: `${mod.title} • ${lesson.title}`
            }))
          )
        );
        
        const uniqueLessons = allLessons.filter((lesson, index, self) => 
          self.findIndex(l => l.id === lesson.id) === index
        );
        
        setLessons(uniqueLessons);
      })
      .catch(() => console.error("Erro ao carregar lições"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setLoading(true);
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/forum");
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao criar post");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen pt-12 pb-20 bg-(--slate-50)">
      <div className="max-w-3xl mx-auto px-6">
        
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-(--clara-rose) transition-colors mb-8"
        >
          <FiArrowLeft size={16} /> Voltar ao Fórum
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Criar Nova <span className="text-(--clara-rose)">Discussão</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
            Compartilhe sua dúvida ou conhecimento com a comunidade
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem] space-y-8">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Título do Tópico</label>
              <Input 
                placeholder="Ex: Dúvida sobre o uso do Subjonctif"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="h-14 bg-slate-50 border-none rounded-2xl text-base font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Esta dúvida é sobre uma aula? (Opcional)</label>
              <div className="relative">
                <select 
                  className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold appearance-none text-slate-600 focus:ring-2 focus:ring-(--clara-rose) outline-none"
                  value={formData.lessonId}
                  onChange={(e) => setFormData({...formData, lessonId: e.target.value})}
                >
                  <option value="">Geral / Outros</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <FiBook className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mensagem</label>
              <textarea 
                placeholder="Explique detalhadamente sua dúvida..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full min-h-[200px] bg-slate-50 border-none rounded-[2rem] p-6 text-base font-medium outline-none focus:ring-2 focus:ring-(--clara-rose) transition-all"
                required
              />
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.back()}
              className="uppercase text-[10px] font-black tracking-widest px-8"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-14 px-10 rounded-2xl shadow-xl hover:scale-105 transition-transform uppercase text-[11px] font-black tracking-widest"
            >
              {loading ? "Publicando..." : "Publicar Tópico"}
              <FiCheck className="ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}