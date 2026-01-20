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
      className={`group flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 bg-white border rounded-xl transition-all gap-3 ${
        isDragging ? 'border-interface-accent shadow-lg z-50' : 'border-s-50 hover:border-s-100'
      }`}
    >
      {/* Esquerda: Drag + Icone + Input */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-s-600 hover:text-s-800 shrink-0">
          <GripVertical size={16} />
        </div>
        
        {/* Indicador de Tipo/Status */}
        <div className={`p-2 rounded-lg shrink-0 ${lesson.isPremium ? 'bg-s-50 text-s-800' : 'bg-s-50 text-s-600'}`}>
           <Edit3 size={14} />
        </div>

        <input
          className="font-bold text-s-800 text-[13px] bg-transparent border-none p-0 focus:ring-0 w-full truncate"
          value={lesson.title}
          onChange={(e) => onUpdateName(lesson.id, e.target.value)}
        />
      </div>

      {/* Direita: Ações (Lacre e Lixo) */}
      <div className="flex items-center justify-end gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-s-50/50">
        <button 
          onClick={() => onToggleLock(lesson.id)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            lesson.isPremium ? 'text-amber-500 bg-amber-50' : 'text-s-400 hover:bg-s-50'
          }`}
        >
          {lesson.isPremium ? <LuLock size={18} /> : <LuLockOpen size={18} />}
        </button>

        <button 
          onClick={() => markForDeletion('lesson', lesson.id)} 
          className="p-2 text-s-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
        >
          <Trash2 size={16} />
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
  handleUpdateLessonName,
  handleToggleModuleLock
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
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row items-center p-4 gap-3">
        
        {/* Esquerda: Drag + Input */}
        <div className="flex items-center gap-3 w-full sm:flex-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-s-600 hover:text-s-800 shrink-0">
            <GripVertical size={18} />
          </div>
          
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              className="font-bold text-s-800 text-sm bg-transparent border-none p-0 focus:ring-0 w-full truncate"
              value={module.title}
              onChange={(e) => handleUpdateModuleName(module.id, e.target.value)}
            />
            
            <Link 
              href={`/admin/content/modules/${module.id}`}
              className="p-2 text-s-600 hover:text-interface-accent bg-s-50 rounded-lg transition-all shrink-0"
            >
              <FaArrowRightFromBracket size={14} />
            </Link>
          </div>
        </div>

        {/* Direita: Botões de Ação */}
        <div className="flex items-center justify-end gap-1 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
          <button
            onClick={() => handleToggleModuleLock(module.id)}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              module.isPremium ? 'text-orange-500 bg-orange-50' : 'text-s-400 hover:bg-s-50'
            }`}
            title={module.isPremium ? "Módulo Premium" : "Módulo Grátis"}
          >
            {module.isPremium ? <LuLock size={18} /> : <LuLockOpen size={18} />}
          </button>
          <button 
            onClick={() => markForDeletion('module', module.id)} 
            className="p-2 text-s-600 hover:text-red-500 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
          >
            <Trash2 size={16} />
          </button>
          
          <button
            onClick={() => setExpandedModule(isExpanded ? null : module.id)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${isExpanded ? 'bg-s-100 text-s-900' : 'text-s-600'}`}
          >
            <span className="text-[10px] font-black uppercase sm:hidden">Lições</span>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {/* Área de Lições (Expandida) */}
      {isExpanded && (
        <div className="bg-s-50/30 border-t border-s-50 p-4 space-y-2">
          {!mounted ? (
            <div className="space-y-2">
              {module.lessons?.map((lesson: any) => (
                <div key={lesson.id} className="p-3 bg-white border rounded-xl opacity-50 text-s-600 text-xs">
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
            className="w-full py-3 border-2 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest text-s-600 hover:text-interface-accent hover:border-interface-accent transition-all flex items-center justify-center gap-2 mt-4 bg-white/50 cursor-pointer"
          >
            <Plus size={14} strokeWidth={3} /> Nova Lição
          </button>
        </div>
      )}
    </div>
  );
}