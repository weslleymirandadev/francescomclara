"use client";

import { useState, useEffect } from "react"; // Adicionado useEffect
import { Lesson, LessonType } from "@prisma/client";

interface CompletionExercise {
  id: string;
  french: string;
  portuguese: string;
  type: "full" | "blank";
  blankPosition?: number;
}

interface SpeakingExercise {
  id: string;
  french: string;
  portuguese: string;
  difficulty: "easy" | "medium" | "hard";
  hints: string[];
}

interface CompletionContent {
  exercises: CompletionExercise[];
}

interface SpeakingContent {
  exercises: SpeakingExercise[];
}

// Funções helper para tratar content de forma segura
const getCompletionContent = (content: any): CompletionContent => {
  if (!content || typeof content !== "object") {
    return { exercises: [] };
  }
  return content as CompletionContent;
};

const getSpeakingContent = (content: any): SpeakingContent => {
  if (!content || typeof content !== "object") {
    return { exercises: [] };
  }
  return content as SpeakingContent;
};

import {
  ChevronLeft,
  Video,
  FileText,
  BookOpen,
  BrainCircuit,
  Lock,
  LockOpen,
  Languages,
  Mic,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SaveChangesBar } from "@/components/ui/savechangesbar";
import { FlashcardEditor } from "./_components/FlashcardEditor";
import { ClassEditor } from "./_components/ClassEditor";
import { ReadingEditor } from "./_components/ReadingEditor";
import { StoryEditor } from "./_components/StoryEditor";
import { CompletionEditor } from "./_components/CompletionEditor";
import { SpeakingEditor } from "./_components/SpeakingEditor";
import { toast } from "react-hot-toast";

interface LessonEditFormProps {
  initialData: Lesson;
  moduleId: string;
}

export function LessonEditForm({ initialData, moduleId }: LessonEditFormProps) {
  const [availableLessons, setAvailableLessons] = useState<
    { id: string; title: string; type: LessonType }[]
  >([]);
  const [lastSavedLesson, setLastSavedLesson] = useState(initialData);
  const [lesson, setLesson] = useState(initialData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  useEffect(() => {
    const fetchModuleLessons = async () => {
      try {
        const res = await fetch(`/api/admin/modules/${moduleId}/lessons`);
        if (res.ok) {
          const data = await res.json();
          setAvailableLessons(data.sort((a: any, b: any) => a.order - b.order));
        }
      } catch (error) {
        console.error("Erro ao carregar aulas do módulo", error);
      }
    };

    fetchModuleLessons();
  }, [moduleId, lesson.id]);

  const getLessonStyle = (type: LessonType) => {
    switch (type) {
      case "CLASS":
        return {
          icon: <Video size={18} />,
          bg: "bg-blue-50",
          text: "text-blue-600",
        };
      case "STORY":
        return {
          icon: <BookOpen size={18} />,
          bg: "bg-indigo-50",
          text: "text-indigo-600",
        };
      case "READING":
        return {
          icon: <FileText size={18} />,
          bg: "bg-orange-50",
          text: "text-orange-600",
        };
      case "FLASHCARD":
        return {
          icon: <BrainCircuit size={18} />,
          bg: "bg-emerald-50",
          text: "text-emerald-600",
        };
      case "COMPLETION":
        return {
          icon: <Languages size={18} />,
          bg: "bg-purple-50",
          text: "text-purple-600",
        };
      case "SPEAKING":
        return {
          icon: <Mic size={18} />,
          bg: "bg-rose-50",
          text: "text-rose-600",
        };
      default:
        return {
          icon: <Video size={18} />,
          bg: "bg-s-100",
          text: "text-s-600",
        };
    }
  };

  const handleUpdate = (updates: Partial<Lesson>) => {
    setLesson((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/admin/modules/${moduleId}/lessons/${lesson.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...lesson,
            content: lesson.content,
          }),
        },
      );

      if (res.ok) {
        setHasUnsavedChanges(false);
        setLastSavedLesson(lesson);
        toast.success("Conteúdo salvo!");
      }
    } catch (error) {
      toast.error("Erro ao salvar.");
    } finally {
      const [availableLessons, setAvailableLessons] = useState<
        { id: string; title: string }[]
      >([]);
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setLesson(lastSavedLesson);
    setHasUnsavedChanges(false);
  };

  const handleNotify = async () => {
    setIsNotifying(true);
    try {
      const res = await fetch(`/api/admin/notify-lesson`, {
        method: "POST",
        body: JSON.stringify({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          moduleId: moduleId,
          lessonType: lesson.type,
        }),
      });

      if (res.ok) toast.success("Notificações enviadas!");
    } catch (e) {
      toast.error("Falha ao notificar.");
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-s-25/30 flex flex-col">
      <SaveChangesBar
        hasChanges={hasUnsavedChanges}
        loading={isSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      <div className="flex flex-1">
        <main className="flex-1 p-4 sm:p-8 md:p-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <header className="flex flex-col gap-6 mb-12">
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/content/modules/${moduleId}`}
                  className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-s-100 shrink-0 transition-all"
                >
                  <ChevronLeft size={24} />
                </Link>
                <input
                  value={lesson.title}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                  className="text-2xl sm:text-4xl font-black uppercase tracking-tighter outline-none w-full bg-transparent text-s-900"
                  placeholder="Título da Aula"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-1 bg-white p-1.5 rounded-[22px] border shadow-sm">
                  {(
                    [
                      "CLASS",
                      "STORY",
                      "READING",
                      "FLASHCARD",
                      "COMPLETION",
                      "SPEAKING",
                    ] as LessonType[]
                  ).map((type) => {
                    const style = getLessonStyle(type);
                    const isSelected = lesson.type === type;
                    return (
                      <button
                        key={type}
                        onClick={() => handleUpdate({ type })}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-s-900 text-white shadow-lg"
                            : "text-s-400 hover:bg-s-50"
                        }`}
                      >
                        {style.icon}
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {type}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleUpdate({ isPremium: !lesson.isPremium })}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                    lesson.isPremium
                      ? "bg-amber-500 border-amber-600 text-white shadow-lg"
                      : "bg-white border-s-100 text-s-500 hover:bg-s-50"
                  }`}
                >
                  {lesson.isPremium ? (
                    <Lock size={14} />
                  ) : (
                    <LockOpen size={14} />
                  )}
                  {lesson.isPremium ? "Premium" : "Gratuita"}
                </button>

                <button
                  onClick={handleNotify}
                  disabled={isNotifying || hasUnsavedChanges}
                  className="px-4 py-3 bg-interface-accent text-white rounded-xl font-bold text-xs uppercase transition-all disabled:opacity-50 hover:bg-interface-accent/90 cursor-pointer"
                >
                  {isNotifying ? "Enviando..." : "Notificar Alunos"}
                </button>
              </div>
            </header>

            <div className="bg-white rounded-[40px] shadow-sm border p-6 sm:p-10 min-h-[500px]">
              {lesson.type === "CLASS" && (
                <ClassEditor
                  content={lesson.content}
                  onChangeAction={(val) => handleUpdate({ content: val })}
                />
              )}
              {lesson.type === "STORY" && (
                <StoryEditor
                  content={lesson.content}
                  onChangeAction={(val) => handleUpdate({ content: val })}
                />
              )}
              {lesson.type === "READING" && (
                <ReadingEditor
                  content={lesson.content}
                  onChangeAction={(val) => handleUpdate({ content: val })}
                />
              )}
              {lesson.type === "FLASHCARD" && (
                <FlashcardEditor
                  content={lesson.content}
                  availableLessons={availableLessons}
                  onChange={(val) => handleUpdate({ content: val })}
                />
              )}
              {lesson.type === "COMPLETION" && (
                <CompletionEditor
                  content={getCompletionContent(lesson.content)}
                  onChange={(val) => handleUpdate({ content: val })}
                />
              )}
              {lesson.type === "SPEAKING" && (
                <SpeakingEditor
                  content={getSpeakingContent(lesson.content)}
                  onChange={(val) => handleUpdate({ content: val })}
                />
              )}
            </div>
          </div>
        </main>

        <aside className="w-80 border-l bg-white hidden xl:flex flex-col sticky top-0 h-screen shadow-2xl shadow-s-900/5">
          <div className="p-8 border-b">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-s-400">
              Navegação Rápida
            </h3>
            <p className="text-xs font-bold text-s-900 mt-1">Aulas do Módulo</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {availableLessons.map((item: any) => {
              const isActive = item.id === lesson.id;
              const lessonType = item.type || "CLASS";
              const style = getLessonStyle(lessonType);

              return (
                <Link
                  key={item.id}
                  href={`/admin/content/modules/${moduleId}/lessons/${item.id}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all group border-2 ${
                    isActive
                      ? "bg-s-900 text-white shadow-xl translate-x-1"
                      : "bg-white border-transparent hover:border-s-50 text-s-500 hover:text-s-900 hover:bg-s-25"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? "bg-white/10" : `${style.bg} ${style.text}`
                    }`}
                  >
                    {style.icon}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-[10px] font-black uppercase truncate ${isActive ? "text-white" : "text-s-900"}`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? "text-white/50" : "text-s-300"}`}
                    >
                      {item.type || "Sem Tipo"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 bg-s-25 border-t mt-auto">
            <Link
              href={`/admin/content/modules/${moduleId}`}
              className="flex items-center justify-center gap-2 py-3 bg-white border border-s-100 rounded-xl text-[9px] font-black uppercase text-s-500 hover:text-s-900 transition-all shadow-sm"
            >
              <ChevronLeft size={12} />
              Voltar ao Módulo
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
