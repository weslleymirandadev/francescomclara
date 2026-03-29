"use client";

import { useState, useEffect } from "react"
import { CEFRLevel, LessonType } from "@prisma/client";
import { ChevronLeft, Lock, LockOpen, GripVertical, Video, FileText, BookOpen, BrainCircuit, Plus } from "lucide-react";
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
import { SaveChangesBar } from "@/components/ui/savechangesbar";
import { toast } from "react-hot-toast";
import { Lesson } from "@prisma/client";

type LessonFormState = Omit<Lesson, 'createdAt' | 'updatedAt' | 'readingText'> & {
  createdAt?: Date;
  updatedAt?: Date;
  readingText?: string | null;
};

function SortableLessonItem({ lesson, moduleId, onExclude, onTogglePremium, onUpdateType, onUpdateTitle }: { lesson: any, moduleId: string, onExclude: (id: string) => void, onTogglePremium: (id: string, status: boolean) => void, onUpdateType: (id: string, type: LessonType) => void, onUpdateTitle: (id: string, title: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Translate.toString(transform),
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
      default: return <Video size={18} className="text-blue-500" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border ${isDragging ? 'border-interface-accent shadow-2xl' : 'border-(--color-s-100)'} p-4 rounded-[24px] sm:rounded-[32px] hover:shadow-lg transition-all mb-3 gap-4 w-full`}>
      <div className="flex items-center gap-3 sm:gap-6 flex-1 w-full min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-s-400 hover:text-s-600 transition-colors shrink-0">
          <GripVertical size={20} />
        </div>
        <div className="w-10 h-10 rounded-2xl bg-s-50 flex items-center justify-center shrink-0">
          {getIcon(lesson.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 group/input w-full">
            <input
              value={lesson.title}
              onChange={(e) => onUpdateTitle(lesson.id, e.target.value)}
              className="bg-transparent border-none outline-none focus:ring-2 focus:ring-interface-accent/20 rounded-lg px-1 py-1 text-sm font-bold text-s-700 w-full transition-all truncate"
              placeholder="Título da aula"
            />
            <LuPencil size={14} className="text-s-400 opacity-0 sm:group-hover/input:opacity-100 transition-opacity shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <select 
              value={lesson.type}
              onChange={(e) => onUpdateType(lesson.id, e.target.value as LessonType)}
              className="text-[9px] font-black text-s-500 uppercase tracking-widest bg-s-50 px-2 py-1 rounded-lg border-none outline-none cursor-pointer hover:bg-s-100 transition-colors"
            >
              <option value="CLASS">Aula</option>
              <option value="STORY">Story</option>
              <option value="READING">Leitura</option>
              <option value="FLASHCARD">Flashcard</option>
            </select>
            <button 
              onClick={() => onTogglePremium(lesson.id, lesson.isPremium)}
              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${lesson.isPremium ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white text-s-600 border-(--color-s-20)"}`}
            >
              {lesson.isPremium ? "Premium" : "Grátis"}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 shrink-0">
        <button onClick={() => onExclude(lesson.id)} className="flex-1 sm:flex-none p-3 text-s-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex justify-center">
          <LuTrash2 size={20} />
        </button>
        {!String(lesson.id).startsWith('temp-') && (
           <Link href={`/admin/content/modules/${moduleId}/lessons/${lesson.id}`} className="flex-1 sm:flex-none p-3 bg-s-50 text-s-600 hover:text-s-900 rounded-xl transition-all flex justify-center">
             <ChevronLeft size={20} className="rotate-180" />
           </Link>
        )}
      </div>
    </div>
  );
}

export function ModuleEditForm({ initialData }: { initialData: any }) {
  const [moduleData, setModuleData] = useState({
    title: initialData.title,
    cefrLevel: initialData.cefrLevel || "A1",
    isPremium: initialData.isPremium
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [lessons, setLessons] = useState<LessonFormState[]>(initialData.lessons);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleAddLesson = () => {
    const newLesson = {
      id: `temp-${Date.now()}`,
      title: "Nova Aula",
      type: "CLASS" as LessonType,
      isPremium: false,
      order: lessons.length,
      moduleId: initialData.id,
      content: ""
    };
    setLessons([...lessons, newLesson as any]);
    setHasUnsavedChanges(true);
  };

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
      await (actions as any).updateModuleAction(initialData.id, moduleData);
      const freshLessons = await (actions as any).syncModuleLessonsAction(initialData.id, lessons, deletedIds);
      setLessons(freshLessons);
      setDeletedIds([]);
      setHasUnsavedChanges(false);
      toast.success("Tudo salvo!");
    } catch (e) {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExclude = (id: string) => {
    if (confirm("Deseja excluir esta aula?")) {
      setLessons(prev => prev.filter(l => l.id !== id));
      if (!String(id).startsWith('temp-')) setDeletedIds(prev => [...prev, id]);
      setHasUnsavedChanges(true);
    }
  };

  const handleDiscard = () => {
    if (confirm("Descartar alterações?")) {
      setModuleData({ title: initialData.title, cefrLevel: initialData.cefrLevel || "A1", isPremium: initialData.isPremium });
      setLessons(initialData.lessons);
      setHasUnsavedChanges(false);
    }
  };

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

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 md:p-12 text-s-900 overflow-x-hidden">
      <SaveChangesBar hasChanges={hasUnsavedChanges} loading={isSaving} onSave={handleSaveAll} onDiscard={handleDiscard} />
      
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3 w-full">
            <Link href="/admin/content" className="p-2 hover:bg-s-50 rounded-xl shrink-0">
              <ChevronLeft size={24} />
            </Link>
            <div className="flex-1 min-w-0">
              <input 
                value={moduleData.title}
                onChange={(e) => { setModuleData({ ...moduleData, title: e.target.value }); setHasUnsavedChanges(true); }}
                className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter outline-none border-b-2 border-transparent focus:border-s-100 w-full truncate"
                placeholder="Título do Módulo"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-s-50 p-2 sm:p-4 rounded-3xl border border-s-100">
             <select 
                value={moduleData.cefrLevel}
                onChange={(e) => { setModuleData({ ...moduleData, cefrLevel: e.target.value as CEFRLevel }); setHasUnsavedChanges(true); }}
                className="flex-1 sm:flex-none bg-white border px-3 py-2 rounded-xl font-bold cursor-pointer text-xs sm:text-sm"
              >
                {Object.values(CEFRLevel).map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
              <button 
                onClick={() => { setModuleData({ ...moduleData, isPremium: !moduleData.isPremium }); setHasUnsavedChanges(true); }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest border transition-all cursor-pointer ${
                  moduleData.isPremium ? "bg-amber-500 text-white border-amber-500 shadow-sm" : "bg-white text-s-600"
                }`}
              >
                {moduleData.isPremium ? <Lock size={14} /> : <LockOpen size={14} />}
                {moduleData.isPremium ? "Premium" : "Grátis"}
              </button>
          </div>
        </header>

        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd} 
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={lessons.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1 sm:gap-3">
              {lessons.map((lesson: any) => (
                <SortableLessonItem 
                  key={lesson.id} 
                  lesson={lesson}
                  moduleId={initialData.id}
                  onUpdateTitle={onUpdateTitle}
                  onUpdateType={onUpdateType}
                  onTogglePremium={onTogglePremium}
                  onExclude={handleExclude}
                />
              ))}
            </div>
          </SortableContext>
          
          <button 
            onClick={handleAddLesson} 
            className="w-full py-4 mt-4 border-2 border-dashed rounded-[24px] sm:rounded-3xl text-s-500 hover:text-interface-accent hover:border-interface-accent transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest bg-white/50 active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={3} /> Nova Aula
          </button>
        </DndContext>
      </div>
    </div>
  );
}