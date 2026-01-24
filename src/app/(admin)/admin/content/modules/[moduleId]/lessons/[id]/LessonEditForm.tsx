"use client";

import { useState } from "react";
import { Lesson, LessonType } from "@prisma/client";
import { ChevronLeft, Video, FileText, BookOpen, BrainCircuit, Lock, LockOpen } from "lucide-react";
import Link from "next/link";
import { SaveChangesBar } from "@/components/ui/savechangesbar";
import { FlashcardEditor } from "./_components/FlashcardEditor";
import { ClassEditor } from "./_components/ClassEditor";
import { ReadingEditor } from "./_components/ReadingEditor";
import { StoryEditor } from "./_components/StoryEditor";

interface LessonEditFormProps {
  initialData: Lesson;
  moduleId: string;
}

export function LessonEditForm({ initialData, moduleId }: LessonEditFormProps) {
  const [lastSavedLesson, setLastSavedLesson] = useState(initialData);
  const [lesson, setLesson] = useState(initialData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      setLastSavedLesson(lesson);
      setHasUnsavedChanges(false);
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setLesson(lastSavedLesson);
    setHasUnsavedChanges(false);
    };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 text-s-900">
      <SaveChangesBar 
        hasChanges={hasUnsavedChanges}
        loading={isSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col gap-8">
          {/* TÍTULO EDITÁVEL */}
          <div className="flex items-center gap-4 group/title">
            <Link href={`/admin/content/modules/${moduleId}`} className="p-2 hover:bg-s-50 rounded-xl transition-all">
              <ChevronLeft size={24} />
            </Link>
            <input 
              value={lesson.title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              className="text-4xl font-black uppercase tracking-tighter outline-none border-b-2 border-transparent focus:border-(--color-s-100) w-full bg-transparent"
            />
          </div>

          {/* CONTROLES DE TIPO E PRIVACIDADE */}
          <div className="flex flex-wrap items-center gap-4 bg-s-50 p-2 rounded-[28px] border border-(--color-s-100) w-fit">
            {/* Seletor de Tipo */}
            <div className="flex gap-1">
              {(['CLASS', 'STORY', 'READING', 'FLASHCARD'] as LessonType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleUpdate({ type })}
                  className={`p-3 rounded-2xl transition-all flex items-center gap-2 ${
                    lesson.type === type 
                    ? "bg-s-900 text-white shadow-lg" 
                    : "text-s-500 hover:bg-s-200"
                  }`}
                  title={type}
                >
                  {getIcon(type)}
                  {lesson.type === type && <span className="text-[10px] font-black uppercase tracking-widest pr-1">{type}</span>}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-s-200 mx-1" />

            {/* Toggle Premium */}
            <button 
              onClick={() => handleUpdate({ isPremium: !lesson.isPremium })}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all border ${
                lesson.isPremium 
                ? "bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-500/20" 
                : "bg-white border-(--color-s-100) text-s-500"
              }`}
            >
              {lesson.isPremium ? <Lock size={14} strokeWidth={3} /> : <LockOpen size={14} strokeWidth={3} />}
              {lesson.isPremium ? "Premium" : "Gratuita"}
            </button>
          </div>
        </header>

        {/* ÁREA DINÂMICA DO CONSTRUTOR */}
        <main className="w-full">
           <div className="bg-white border-2 border-dashed min-h-[500px] rounded-[40px] p-8 flex flex-col items-center justify-center relative transition-all hover:bg-s-100">
              
              {lesson.type === 'CLASS' && (
                <ClassEditor content={lesson.content} onChange={(val) => handleUpdate({ content: val })} />
              )}

              {lesson.type === 'FLASHCARD' && (
                <FlashcardEditor content={lesson.content} onChange={(val) => handleUpdate({ content: val })} />
              )}

              {lesson.type === 'READING' && (
                <ReadingEditor content={lesson.content} onChange={(val) => handleUpdate({ content: val })} />
              )}

              {lesson.type === 'STORY' && (
                <StoryEditor content={lesson.content} onChange={(val) => handleUpdate({ content: val })} />
              )}

           </div>
        </main>
      </div>
    </div>
  );
}