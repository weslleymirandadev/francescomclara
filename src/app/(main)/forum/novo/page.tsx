"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheck,
  FiHelpCircle,
  FiBook,
  FiImage,
  FiVideo,
  FiX,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { toast } from "react-hot-toast";

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
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    lessonId: "",
  });

  useEffect(() => {
    fetch("/api/public/content")
      .then((res) => res.json())
      .then((data: ContentResponse) => {
        const allLessons = data.tracks.flatMap((track) =>
          track.modules.flatMap((mod) =>
            mod.lessons.map((lesson) => ({
              id: lesson.id,
              title: `${mod.title} • ${lesson.title}`,
            })),
          ),
        );

        const uniqueLessons = allLessons.filter(
          (lesson, index, self) =>
            self.findIndex((l) => l.id === lesson.id) === index,
        );

        setLessons(uniqueLessons);
      })
      .catch(() => console.error("Erro ao carregar lições"));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map((f) => ({
        url: URL.createObjectURL(f),
        type: f.type.startsWith("video/") ? "VIDEO" : "IMAGE",
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedAttachments = [];

      for (const f of files) {
        const formData = new FormData();
        formData.append("file", f);
        const res = await fetch("/api/forum/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        uploadedAttachments.push({
          url: data.url,
          type: f.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        });
      }

      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          attachments: uploadedAttachments,
        }),
      });

      if (res.ok) {
        toast.success("Post criado!");
        router.push("/forum");
      }
    } catch (error) {
      toast.error("Erro ao publicar");
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
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-(--clara-rose) transition-colors mb-8 cursor-pointer"
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
          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 mt-4">
              {previews.map((att, index) => (
                <div
                  key={index}
                  className="relative rounded-2xl overflow-hidden border-2 border-(--clara-rose) h-100"
                >
                  {att.type === "IMAGE" ? (
                    <img src={att.url} className="w-full h-full object-cover" />
                  ) : (
                    <video
                      src={att.url}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFiles((prev) => prev.filter((_, i) => i !== index));
                      setPreviews((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md cursor-pointer"
                  >
                    <FiX className="text-red-500" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem] space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Título do Tópico
              </label>
              <Input
                placeholder="Ex: Dúvida sobre o uso do Subjonctif"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="h-14 bg-slate-50 border-none rounded-2xl text-base font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Esta dúvida é sobre uma aula? (Opcional)
              </label>
              <div className="relative">
                <select
                  className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold appearance-none text-slate-600 focus:ring-2 focus:ring-(--clara-rose) outline-none"
                  value={formData.lessonId}
                  onChange={(e) =>
                    setFormData({ ...formData, lessonId: e.target.value })
                  }
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Mensagem
              </label>
              <textarea
                placeholder="Explique detalhadamente sua dúvida..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full min-h-[200px] bg-slate-50 border-none rounded-[2rem] p-6 text-base font-medium outline-none focus:ring-2 focus:ring-(--clara-rose) transition-all"
                required
              />
            </div>

            {/* Botões de Upload */}
            <div className="flex gap-4 mt-4">
              <label className="flex items-center gap-2 px-6 h-12 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600">
                <FiImage size={18} /> Inserir Imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <label className="flex items-center gap-2 px-6 h-12 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600">
                <FiVideo size={18} /> Inserir Vídeo
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
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
// O Next.js pode lançar erro se setar cookies em Server Components,
// mas em Route Handlers como este, funciona normalmente.
