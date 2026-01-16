import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Plus, GripVertical } from "lucide-react";
import { LuImagePlus, LuTrash2 } from "react-icons/lu";
import { HiArrowUturnLeft } from "react-icons/hi2";

interface SortableTrackItemProps {
  track: any;
  configs: any[];
  plans: any[];
  openTracks: string[];
  setOpenTracks: React.Dispatch<React.SetStateAction<string[]>>;
  setLocalTracks: React.Dispatch<React.SetStateAction<any[]>>;
  setHasChanges: (val: boolean) => void;
  markForDeletion: (type: 'track' | 'module' | 'lesson' | 'objective', id: string) => void;
  handleCreateModuleLocal: (trackId: string) => any;
  setExpandedModule: (id: string | null) => void;
  handleTrackNameChange: (id: string, name: string) => void; 
  handleTrackDescriptionChange: (id: string, desc: string) => void;
  handleLessonDragEnd: (event: any, moduleId: string) => void;
  handleToggleLessonLock: (lessonId: string) => void;
  handleUpdateLessonName: (lessonId: string, name: string) => void;
  handleToggleModuleLock: (moduleId: string) => void;
  renderModules: (track: any) => React.ReactNode;
  EditableName: any;
  EditableDescription: any;
}

export function SortableTrackItem({
  track,
  configs,
  plans,
  openTracks,
  setOpenTracks,
  setLocalTracks,
  setHasChanges,
  markForDeletion,
  handleCreateModuleLocal,
  setExpandedModule,
  handleTrackNameChange,
  handleTrackDescriptionChange,
  renderModules,
  handleLessonDragEnd,
  handleToggleLessonLock,
  handleUpdateLessonName,
  handleToggleModuleLock,
  EditableName,
  EditableDescription
}: SortableTrackItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0
  };

  const isOpen = openTracks.includes(track.id);

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-[2.5rem] overflow-hidden transition-all ${isDragging ? 'z-50 border-interface-accent shadow-2xl' : 'border-s-50'}`}>
      {/* Container Principal: Coluna no mobile (flex-col), Linha no desktop (md:flex-row) */}
      <div className={`group p-6 flex flex-col md:flex-row items-stretch md:items-start gap-6 transition-all ${!track.active ? 'bg-s-100' : 'bg-white'}`}>
        
        {/* Esquerda: Drag e Imagem */}
        <div className="flex gap-4">
          <div {...attributes} {...listeners} className="px-2 flex items-center cursor-grab active:cursor-grabbing text-s-600 hover:text-s-800">
            <GripVertical size={20} />
          </div>

          <div className="relative w-full md:w-60 h-48 md:h-80 shrink-0 rounded-[2rem] overflow-hidden group/img shadow-sm">
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setLocalTracks(prev => prev.map(t => t.id === track.id ? { ...t, imageUrl: base64 } : t));
                    setHasChanges(true);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <img src={track.imageUrl || "https://placehold.co/400x400/f8f9fa/666?text=+"} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity z-10 pointer-events-none">
              <LuImagePlus size={18} className="text-white" />
            </div>
          </div>
        </div>

        {/* Direita: Conteúdo e Inputs */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <EditableName track={track} onNameChange={handleTrackNameChange} />

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <div className="flex gap-2">
                {!track.active ? (
                  <span className="bg-zinc-100 text-zinc-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-zinc-200">Rascunho</span>
                ) : (
                  <span className="bg-green-100 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-200">Online</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (!track.active && !window.confirm("Ativar trilha imediatamente para os alunos?")) return;
                    setLocalTracks(prev => prev.map(t => t.id === track.id ? { ...t, active: !t.active } : t));
                    setHasChanges(true);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all cursor-pointer hover:bg-s-50 ${track.active ? 'bg-white border-green-200 text-green-600' : 'bg-white border-zinc-200 text-zinc-400'}`}
                >
                  {track.active ? 'Ativo' : 'Inativo'} {track.active ? <HiArrowUturnLeft size={12} /> : <Plus size={12} />}
                </button>

                <select
                  value={track.objectiveId}
                  onChange={(e) => {
                    setLocalTracks(prev => prev.map(t => t.id === track.id ? { ...t, objectiveId: e.target.value } : t));
                    setHasChanges(true);
                  }}
                  className="appearance-none bg-s-50 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-s-700 outline-none cursor-pointer border hover:bg-white transition-all"
                >
                  {configs.map((obj: any) => <option key={obj.id} value={obj.id}>{obj.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <EditableDescription track={track} onValueChange={handleTrackDescriptionChange} />

          {/* Rodapé: Botões de Ação e Planos */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-s-50/50">
            <div className="flex flex-wrap gap-1.5 justify-start w-full">
              {plans?.map((plan) => {
                const hasAccess = track.subscriptionPlans?.some((spt: any) => spt.subscriptionPlanId === plan.id);
                return (
                  <button
                    key={plan.id}
                    onClick={() => {
                      setLocalTracks(prev => prev.map(t => {
                        if (t.id !== track.id) return t;
                        const currentPlans = t.subscriptionPlans || [];
                        return {
                          ...t,
                          subscriptionPlans: hasAccess 
                            ? currentPlans.filter((p: any) => p.subscriptionPlanId !== plan.id)
                            : [...currentPlans, { subscriptionPlanId: plan.id, trackId: t.id }]
                        };
                      }));
                      setHasChanges(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all flex items-center gap-2 cursor-pointer hover:shadow-xl hover:border ${hasAccess ? "bg-green-500 border-green-600 text-white" : "bg-s-50 border-s-20 text-s-800 opacity-60"}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${hasAccess ? "bg-white" : "bg-s-600"}`} />
                    {plan.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  const newModule = handleCreateModuleLocal(track.id);
                  setExpandedModule(newModule.id);
                  if (!isOpen) setOpenTracks([...openTracks, track.id]);
                }}
                className="flex items-center gap-3 p-2 rounded-2xl border-2 border-dashed text-s-600 hover:text-s-800 transition-all whitespace-nowrap cursor-pointer"
              >
                <Plus size={18} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Módulo</span>
              </button>
              <button onClick={() => markForDeletion('track', track.id)} className="p-3 text-s-600 rounded-xl hover:text-red-600 hover:bg-red-50 cursor-pointer"><LuTrash2 size={20} /></button>
              <button onClick={() => setOpenTracks(prev => isOpen ? prev.filter(id => id !== track.id) : [...prev, track.id])} className="p-2 rounded-2xl bg-s-20 text-s-800 cursor-pointer">
                <ChevronDown size={24} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Expandido */}
      {isOpen && (
        <div className="pl-6 md:pl-12 pr-4 pb-8 animate-in slide-in-from-top-2 duration-300">
          {renderModules(track)}
        </div>
      )}
    </div>
  );
}