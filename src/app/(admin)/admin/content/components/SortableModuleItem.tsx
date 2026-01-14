import { useState, useEffect } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronRight, Plus, Trash2, Edit3 } from "lucide-react";
import { LuLock, LuLockOpen } from "react-icons/lu";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import Link from "next/link";

function SortableLessonItem({ lesson, markForDeletion, onToggleLock, onUpdateName }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`group flex items-center justify-between p-3 bg-white border rounded-xl transition-all ${isDragging ? 'border-interface-accent shadow-lg z-50' : 'border-s-50 hover:border-s-100'}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-s-600 hover:text-s-800">
          <GripVertical size={14} />
        </div>

        <button 
          onClick={() => onToggleLock(lesson.id)}
          className={`transition-colors ${lesson.locked ? 'text-amber-500' : 'text-s-600 hover:text-interface-accent'}`}
        >
          {lesson.locked ? <LuLock size={14} /> : <LuLockOpen size={14} />}
        </button>

        <input 
          className="text-xs font-medium text-s-700 bg-transparent border-none p-0 focus:ring-0 w-full outline-none"
          value={lesson.title}
          onChange={(e) => onUpdateName(lesson.id, e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-1">
        <Link href={`/admin/content/lessons/${lesson.id}`} className="p-1.5 text-s-600 hover:text-interface-accent">
          <Edit3 size={14} />
        </Link>
        <button onClick={() => markForDeletion('lesson', lesson.id)} className="p-1.5 text-s-600 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function SortableModuleItem({
  module,
  expandedModule,
  setExpandedModule,
  markForDeletion,
  handleUpdateModuleName,
  handleCreateLessonLocal,
  handleLessonDragEnd,
  handleToggleLessonLock,
  handleUpdateLessonName
}: any) {
  const [mounted, setMounted] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 60 : 0
  };

  const isExpanded = expandedModule === module.id;

  useEffect(() => {
    setMounted(true);
  }, []);
  

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border-2 rounded-2xl overflow-hidden ${isDragging ? 'border-interface-accent shadow-xl' : 'border-s-50'}`}>
      <div className="flex items-center p-4 gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-s-300">
          <GripVertical size={18} />
        </div>
        
        <div className="flex-1 flex items-center gap-3">
          <input
            className="font-bold text-s-800 text-sm bg-transparent border-none p-0 focus:ring-0 w-full"
            value={module.title}
            onChange={(e) => handleUpdateModuleName(module.id, e.target.value)}
          />
          
          <Link 
            href={`/admin/content/modules/${module.id}`}
            className="p-2 text-s-600 hover:text-interface-accent bg-s-50 rounded-lg transition-all"
          >
            <FaArrowRightFromBracket size={14} />
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => markForDeletion('module', module.id)} className="p-2 text-s-600 hover:text-red-500">
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setExpandedModule(isExpanded ? null : module.id)}
            className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-s-100 text-s-900' : 'text-s-600'}`}
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-s-50/30 border-t border-s-50 p-4 space-y-2">
            {!mounted ? (
                <div className="space-y-2">
                    {module.lessons?.map((lesson: any) => (
                    <div key={lesson.id} className="p-3 bg-white border rounded-xl opacity-50">
                        {lesson.title}
                    </div>
                    ))}
                </div>
            ) : (
                <DndContext 
                    collisionDetection={closestCenter} 
                    onDragEnd={(e) => handleLessonDragEnd(e, module.id)}
                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                    <SortableContext items={module.lessons?.map((l: any) => l.id) || []} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {module.lessons?.map((lesson: any) => (
                        <SortableLessonItem 
                            key={lesson.id} 
                            lesson={lesson} 
                            markForDeletion={markForDeletion}
                            onToggleLock={handleToggleLessonLock}
                            onUpdateName={handleUpdateLessonName}
                        />
                        ))}
                    </div>
                    </SortableContext>
                </DndContext>
            )}

            <button
                onClick={() => handleCreateLessonLocal(module.id)}
                className="w-full py-2 border-2 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest text-s-600 hover:text-interface-accent hover:border-interface-accent transition-all flex items-center justify-center gap-2 mt-2"
            >
                <Plus size={14} strokeWidth={3} /> Nova Lição
            </button>
        </div>
      )}
    </div>
  );
}