"use client";

import { useState, useEffect } from "react"
import { CEFRLevel, LessonType } from "@prisma/client";
import { ChevronLeft, Lock, LockOpen, GripVertical, Video, FileText, BookOpen, BrainCircuit } from "lucide-react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import Link from "next/link";
import * as actions from "../../actions";
import { CSS } from "@dnd-kit/utilities";
import {
  useSortable, arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { 
  DndContext, closestCenter, KeyboardSensor, 
  PointerSensor, useSensor, useSensors 
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";

function SortableLessonItem({ lesson, moduleId, onExclude, onTogglePremium, onUpdateType, onUpdateTitle }: { lesson: any, moduleId: string, onExclude: (id: string) => void, onTogglePremium: (id: string, status: boolean) => void, onUpdateType: (id: string, type: LessonType) => void, onUpdateTitle: (id: string, title: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = (type: LessonType) => {
    switch (type) {
      case 'CLASS': return <Video size={18} className="text-blue-500" />;
      case 'STORY': return <BookOpen size={18} className="text-purple-500" />;
      case 'READING': return <FileText size={18} className="text-amber-500" />;
      case 'FLASHCARD': return <BrainCircuit size={18} className="text-emerald-500" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`group flex items-center justify-between bg-white border ${isDragging ? 'border-interface-accent shadow-2xl' : 'border-s-100'} p-6 rounded-[32px] hover:shadow-lg transition-all mb-4`}>
      <div className="flex items-center gap-6 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-s-400 hover:text-s-600 transition-colors">
          <GripVertical size={20} />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-s-50 flex items-center justify-center shrink-0">{getIcon(lesson.type)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 group/title">
            <input 
              value={lesson.title} // Mudado para value para ser controlado
              onChange={(e) => onUpdateTitle(lesson.id, e.target.value)}
              className="bg-transparent font-bold text-s-800 text-xl outline-none border-b border-transparent focus:border-interface-accent transition-all"
            />
            <LuPencil size={14} className="text-s-600 opacity-0 group-hover/title:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <select 
              value={lesson.type}
              onChange={(e) => onUpdateType(lesson.id, e.target.value as LessonType)}
              className="text-[10px] font-black text-s-500 uppercase tracking-widest bg-s-50 px-2 py-1 rounded-lg border-none outline-none cursor-pointer hover:bg-s-100 transition-colors"
            >
              <option value="CLASS">Aula</option>
              <option value="STORY">Story</option>
              <option value="READING">Leitura</option>
              <option value="FLASHCARD">Flashcard</option>
            </select>
            <button 
              onClick={() => onTogglePremium(lesson.id, lesson.isPremium)}
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border cursor-pointer ${lesson.isPremium ? "bg-amber-50 border-amber-200 text-amber-600" : "text-s-600 border-s-20"}`}
            >
              {lesson.isPremium ? "Premium" : "Grátis"}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onExclude(lesson.id)} className="p-4 text-s-600 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all cursor-pointer"><LuTrash2 size={20} /></button>
        <Link href={`/admin/content/modules/${moduleId}/lessons/${lesson.id}`} className="p-4 bg-s-50 text-s-600 hover:text-s-900 rounded-2xl transition-all">
          <ChevronLeft size={20} className="rotate-180" />
        </Link>
      </div>
    </div>
  );
}

export function ModuleEditForm({ initialData }: { initialData: any }) {
  const [moduleData, setModuleData] = useState({
    title: initialData.title,
    cefrLevel: initialData.cefrLevel || "",
    isPremium: initialData.isPremium
  });
  const [lessons, setLessons] = useState(initialData.lessons);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const onUpdateTitle = (id: string, title: string) => {
    setLessons(lessons.map((l: any) => l.id === id ? { ...l, title } : l));
    setHasUnsavedChanges(true);
  };

  const onUpdateType = (id: string, type: LessonType) => {
    setLessons(lessons.map((l: any) => l.id === id ? { ...l, type } : l));
    setHasUnsavedChanges(true);
  };

  const onTogglePremium = (id: string, current: boolean) => {
    setLessons(lessons.map((l: any) => l.id === id ? { ...l, isPremium: !current } : l));
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await actions.updateModuleAction(initialData.id, {
        title: moduleData.title,
        cefrLevel: moduleData.cefrLevel as CEFRLevel,
        isPremium: moduleData.isPremium
      });

      await actions.reorderLessonsAction(lessons.map((l: any) => l.id));
      for (const lesson of lessons) {
        await actions.updateLessonTitleAction(lesson.id, lesson.title);
        await actions.updateLessonTypeAction(lesson.id, lesson.type);
        await actions.toggleLessonPremiumAction(lesson.id, !lesson.isPremium);
      }

      setHasUnsavedChanges(false);
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a')) {
        if (!confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [hasUnsavedChanges]);

  useEffect(() => { setMounted(true); }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = lessons.findIndex((l: any) => l.id === active.id);
      const newIndex = lessons.findIndex((l: any) => l.id === over.id);
      setLessons(arrayMove(lessons, oldIndex, newIndex));
      setHasUnsavedChanges(true);
    }
  };

  if (!mounted) return <div className="max-w-6xl mx-auto p-12">Carregando...</div>;

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 text-s-900">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-4 group/title">
            <Link href={`/admin/content?obj=${initialData.track.objectiveId}&track=${initialData.trackId}`} className="p-2 hover:bg-s-50 rounded-xl transition-all"><ChevronLeft size={24} /></Link>
            <input 
              value={moduleData.title}
              onChange={(e) => { setModuleData({ ...moduleData, title: e.target.value }); setHasUnsavedChanges(true); }}
              className="text-4xl font-black uppercase tracking-tighter outline-none border-b-2 border-transparent focus:border-s-100 w-full"
            />
          </div>

          <div className="flex items-center gap-4 bg-s-50 p-4 rounded-3xl border border-s-100">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-s-400 ml-1">Nível CEFR</span>
              <select 
                value={moduleData.cefrLevel}
                onChange={(e) => { setModuleData({ ...moduleData, cefrLevel: e.target.value }); setHasUnsavedChanges(true); }}
                className="bg-white border border-s-100 px-4 py-2 rounded-xl font-bold text-s-700 outline-none"
              >
                {Object.values(CEFRLevel).map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>

            <button 
              onClick={() => { setModuleData({ ...moduleData, isPremium: !moduleData.isPremium }); setHasUnsavedChanges(true); }}
              className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all ${moduleData.isPremium ? "bg-amber-500 border-amber-600 text-white" : "bg-white border-s-100 text-s-600"}`}
            >
              {moduleData.isPremium ? <Lock size={14} /> : <LockOpen size={14} />}
              {moduleData.isPremium ? "Módulo Premium" : "Módulo Gratuito"}
            </button>
          </div>
        </header>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
          <SortableContext items={lessons.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col">
              {lessons.map((lesson: any) => (
                <SortableLessonItem 
                  key={lesson.id} 
                  lesson={lesson}
                  moduleId={initialData.id}
                  onUpdateTitle={onUpdateTitle}
                  onUpdateType={onUpdateType}
                  onTogglePremium={onTogglePremium}
                  onExclude={(id) => { if(confirm("Excluir?")) { setLessons(lessons.filter((l: any) => l.id !== id)); setHasUnsavedChanges(true); }}}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {hasUnsavedChanges && (
          <div className="fixed top-8 right-8 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white border border-s-100 shadow-2xl rounded-3xl p-2 flex items-center gap-4 pl-6">
              <span className="text-[10px] font-black text-s-500 uppercase tracking-widest">{isSaving ? "Salvando..." : "Alterações Pendentes"}</span>
              <button onClick={handleSaveAll} disabled={isSaving} className="bg-interface-accent text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-110 shadow-lg">Salvar Agora</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}