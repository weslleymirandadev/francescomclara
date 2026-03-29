"use client";

import { useState, useEffect } from "react"; // Adicionado useEffect
import { Lesson, LessonType } from "@prisma/client";
import { ChevronLeft, Video, FileText, BookOpen, BrainCircuit, Lock, LockOpen } from "lucide-react";
import Link from "next/link";
import { SaveChangesBar } from "@/components/ui/savechangesbar";
import { FlashcardEditor } from "./_components/FlashcardEditor";
import { ClassEditor } from "./_components/ClassEditor";
import { ReadingEditor } from "./_components/ReadingEditor";
import { StoryEditor } from "./_components/StoryEditor";
import { toast } from "react-hot-toast";

interface LessonEditFormProps {
  initialData: Lesson;
  moduleId: string;
}

export function LessonEditForm({ initialData, moduleId }: LessonEditFormProps) {
  const [lastSavedLesson, setLastSavedLesson] = useState(initialData);
  const [lesson, setLesson] = useState(initialData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableLessons, setAvailableLessons] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    const fetchModuleLessons = async () => {
      try {
        const res = await fetch(`/api/admin/modules/${moduleId}/lessons`);
        if (res.ok) {
          const data = await res.json();
          setAvailableLessons(data.filter((l: Lesson) => l.id !== lesson.id));
        }
      } catch (error) {
        console.error("Erro ao carregar aulas do módulo", error);
      }
    };

    fetchModuleLessons();
  }, [moduleId, lesson.id]);

  const getIcon = (type: LessonType) => {
    switch (type) {
      case 'CLASS': return <Video size={20} />;
      case 'STORY': return <BookOpen size={20} />;
      case 'READING': return <FileText size={20} />;
      case 'FLASHCARD': return <BrainCircuit size={20} />;
    }
  };

  const handleUpdate = (updates: Partial<Lesson>) => {
    setLesson(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lesson,
          content: lesson.content 
        }),
      });

      if (res.ok) {
        setHasUnsavedChanges(false);
        setLastSavedLesson(lesson);
        toast.success("Conteúdo salvo!");
      }
    } catch (error) {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setLesson(lastSavedLesson);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <SaveChangesBar 
        hasChanges={hasUnsavedChanges}
        loading={isSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      <div className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
        <header className="flex flex-col gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin/content/modules/${moduleId}`} className="p-2 hover:bg-s-50 rounded-xl shrink-0">
              <ChevronLeft size={24} />
            </Link>
            <input 
              value={lesson.title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              className="text-2xl sm:text-4xl font-black uppercase tracking-tighter outline-none w-full bg-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-wrap gap-1 bg-s-50 p-1.5 rounded-[22px] border w-fit">
              {(['CLASS', 'STORY', 'READING', 'FLASHCARD'] as LessonType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleUpdate({ type })}
                  className={`p-3 rounded-2xl transition-all flex items-center gap-2 ${
                    lesson.type === type 
                    ? "bg-s-900 text-white shadow-md" 
                    : "text-s-500 hover:bg-s-200"
                  }`}
                >
                  {getIcon(type)}
                  {lesson.type === type && <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleUpdate({ isPremium: !lesson.isPremium })}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all sm:ml-auto ${
                lesson.isPremium 
                ? "bg-amber-500 border-amber-600 text-white" 
                : "bg-white border-s-100 text-s-500"
              }`}
            >
              {lesson.isPremium ? <Lock size={14} /> : <LockOpen size={14} />}
              {lesson.isPremium ? "Premium" : "Gratuita"}
            </button>
          </div>
        </header>

        <main>
           <div className="bg-white border-2 border-dashed rounded-[32px] sm:rounded-[40px] p-4 sm:p-8 md:p-10 flex flex-col items-center justify-center relative min-h-[400px]">
              {lesson.type === 'CLASS' && <ClassEditor content={lesson.content} onChange={(val) => handleUpdate({ content: val })} />}
              
              {lesson.type === 'FLASHCARD' && (
                <FlashcardEditor 
                  content={lesson.content} 
                  availableLessons={availableLessons} 
                  onChange={(val) => handleUpdate({ content: val })} 
                />
              )}
              
              {lesson.type === 'READING' && <ReadingEditor content={lesson.content} onChange={(val) => handleUpdate({ content: val })} />}
              {lesson.type === 'STORY' && <StoryEditor content={lesson.content} onChange={(val) => handleUpdate({ content: val })} />}
           </div>
        </main>
      </div>
    </div>
  );
}