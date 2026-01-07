"use client";

import { Objective } from "@prisma/client";
import { Trash2, ChevronDown, ChevronRight, ChevronLeft,Plus, Check, X } from "lucide-react";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { LuImagePlus, LuPencil, LuTrash2, LuLock, LuLockOpen } from "react-icons/lu";
import { HiArrowUturnLeft } from "react-icons/hi2";
import { useState } from "react";
import Link from "next/link";
import ObjectiveBanner from "./ObjectiveBanner";
import * as actions from "./actions";

const EditableName = ({ track }: { track: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(track.name);
  const inputRef = useState<HTMLInputElement | null>(null);
  const hasChanges = tempValue !== track.name;

  const handleSave = async () => {
    if (hasChanges) {
      await actions.updateTrackAction(track.id, { name: tempValue });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(track.name);
    setIsEditing(false);
  };

  return (
    <div className="relative flex-1 group/name flex items-center gap-3 w-60">
      <input 
        id={`name-${track.id}`}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => { if (!hasChanges) setIsEditing(false); }}
        className={`font-black uppercase text-3xl tracking-tighter font-frenchpress bg-transparent border-none focus:ring-0 p-0 flex-1 transition-colors ${
          hasChanges ? 'text-[var(--interface-accent)]' : 'text-s-800'
        }`}
      />
      
      <div className="flex gap-2 shrink-0">
        {isEditing && hasChanges ? (
          <div className="flex gap-1 animate-in fade-in zoom-in duration-200">
            <button onClick={handleSave} className="bg-green-500 text-white p-1.5 rounded-full shadow-lg hover:bg-green-600 cursor-pointer">
              <Check size={14} strokeWidth={4} />
            </button>
            <button onClick={handleCancel} className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 cursor-pointer">
              <X size={14} strokeWidth={4} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => document.getElementById(`name-${track.id}`)?.focus()}
            className="text-s-400 hover:text-s-800 transition-colors cursor-pointer"
          >
            <LuPencil size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

const EditableDescription = ({ track }: { track: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(track.description);
  const hasChanges = tempValue !== track.description;

  const handleSave = async () => {
    if (hasChanges) {
      await actions.updateTrackAction(track.id, { description: tempValue });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(track.description);
    setIsEditing(false);
  };

  return (
    <div className="relative max-w-3xl group/desc">
      <textarea 
        id={`desc-${track.id}`}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => { if (!hasChanges) setIsEditing(false); }}
        className={`w-full bg-white/20 border rounded-2xl p-4 text-s-700 text-sm font-medium leading-relaxed focus:ring-0 transition-all min-h-[100px] pr-14 resize-none shadow-inner ${
          hasChanges ? 'border-[var(--interface-accent)]' : 'border-s-50'
        }`}
      />
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {isEditing && hasChanges ? (
          <>
            <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 animate-in zoom-in duration-200 cursor-pointer">
              <Check size={14} strokeWidth={4} />
            </button>
            <button onClick={handleCancel} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 animate-in zoom-in duration-200 cursor-pointer">
              <X size={14} strokeWidth={4} />
            </button>
          </>
        ) : (
          <button 
            onClick={() => document.getElementById(`desc-${track.id}`)?.focus()}
            className="text-s-800 hover:text-[var(--interface-accent)] p-1 transition-colors cursor-pointer"
          >
            <LuPencil size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default function ContentList({ tracks, configs, plans }: { tracks: any[]; configs: any[]; plans: any[] }) {
  const objectives = configs;
  const [activeObjectiveId, setActiveObjectiveId] = useState(objectives[0]?.id);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const tracksInObjective = tracks.filter(t => t.objectiveId === activeObjectiveId);
  const activeObjective = objectives.find(obj => obj.id === activeObjectiveId);

  const moveObjective = async (index: number, direction: 'left' | 'right') => {
    const newObjectives = [...objectives];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newObjectives.length) return;

    [newObjectives[index], newObjectives[targetIndex]] = [newObjectives[targetIndex], newObjectives[index]];

    const orderedIds = newObjectives.map(o => o.id);
    await actions.reorderObjectivesAction(orderedIds);
  };

  return (
    <>
      <div className="space-y-8 mb-12">
        <div className="flex justify-between items-end border-b border-s-50 pb-2">
          <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-[calc(100vw-500px)] border-b border-s-100 px-4 py-4">
            {objectives.map((o, index) => (
              <div key={o.id} className="group relative flex items-center shrink-0">
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-30">
                  <button 
                    onClick={() => moveObjective(index, 'left')}
                    className="bg-s-900 text-white p-0.5 rounded-l hover:bg-black disabled:opacity-30"
                    disabled={index === 0}
                  >
                    <ChevronLeft size={10} />
                  </button>
                  <button 
                    onClick={() => moveObjective(index, 'right')}
                    className="bg-s-900 text-white p-0.5 rounded-r hover:bg-black disabled:opacity-30"
                    disabled={index === objectives.length - 1}
                  >
                    <ChevronRight size={10} />
                  </button>
                </div>
                <button
                  onClick={() => setActiveObjectiveId(o.id)}
                  onDoubleClick={async () => {
                    const newName = prompt("Novo nome do objetivo:", o.name);
                    if (newName && newName !== o.name) {
                      await actions.updateObjectiveNameAction(o.id, newName);
                    }
                  }}
                  className={`px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap relative ${
                    activeObjectiveId === o.id
                    ? 'text-[var(--interface-accent)]' 
                    : 'text-s-400 hover:text-s-600'
                  }`}
                >
                  {o.name}
                  {activeObjectiveId === o.id && (
                    <div className="absolute bottom-[-17px] left-0 w-full h-[3px] bg-[var(--interface-accent)] rounded-full z-10" />
                  )}
                </button>

                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if(confirm(`Excluir o objetivo "${o.name}"?`)) {
                      await actions.deleteObjectiveAction(o.id);

                      if (activeObjectiveId === o.id) {
                        const nextObjective = objectives.find(obj => obj.id !== o.id);
                        if (nextObjective) {
                          setActiveObjectiveId(nextObjective.id);
                        }
                      }
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 transition-all shadow-md z-20"
                >
                  <X size={10} strokeWidth={4} />
                </button>
              </div>
            ))}
            
            <button 
              onClick={async () => {
                const name = prompt("Digite o nome do novo objetivo:");
                if (name) await actions.createObjectiveAction(name);
              }}
              className="p-4 text-s-300 hover:text-s-900 shrink-0 mb-[-4px]"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </nav>

          <button 
            onClick={() => {
              if (!activeObjectiveId) {
                alert("⚠️ Opa! Você precisa selecionar ou criar um Objetivo (aba) antes de adicionar uma trilha.");
                return;
              }
              actions.createTrackAction(activeObjectiveId);
            }}
            className={`bg-s-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all mb-2 max-w-[250px] min-w-[250px] truncate block 
              ${
                !activeObjectiveId 
                  ? 'text-s-400 cursor-not-allowed'
                  : 'text-white hover:bg-black shadow-lg shadow-s-900/20'
              }`}
            title={`+ Nova Trilha em ${activeObjective?.name}`}
          >
            + Nova Trilha em {activeObjective?.name || "Objetivo"}
          </button>
        </div>
      </div>

      <section key={activeObjectiveId} className="space-y-5">
        <ObjectiveBanner objective={activeObjective} currentImg={activeObjective?.imageUrl} />
        
        <div className="space-y-4 px-2 relative z-40">
          {tracksInObjective.map((track) => (
            <div key={track.id} className="space-y-3">

            <div className={`group bg-s-100 backdrop-blur-md p-6 px-3 rounded-[32px] border border-s-50 border-s-slate-200 flex justify-between items-center transition-all ${!track.active ? 'border-zinc-300' : 'border-solid border-s-50'}`}>
              <div className="flex items-start gap-6 flex-1">
                <div className="relative w-24 h-24 rounded-2xl bg-s-20 border border-s-1 overflow-hidden shrink-0 group/img shadow-sm">
                  <input 
                    type="file" accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => actions.updateTrackAction(track.id, { imageUrl: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <img src={track.imageUrl || "https://placehold.co/400x400/f8f9fa/666?text=+"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity z-10 pointer-events-none">
                    <LuImagePlus size={18} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-12">
                    <EditableName track={track} />

                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        {!track.active ? (
                          <span className="bg-zinc-100 text-zinc-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-zinc-200 shadow-sm">
                            Rascunho
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-200 shadow-sm">
                            Online
                          </span>
                        )}

                        {!(track.modules?.length > 0 && track.modules.some((m: any) => m.lessons?.length > 0)) && (
                          <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-100 shadow-sm">
                            Sem Conteúdo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={async () => {
                            if (!track.active) {
                              const confirmed = window.confirm("Tem certeza? Todos os alunos que possuem acesso aos planos desta trilha poderão vê-la imediatamente!");
                              if (!confirmed) return;
                            }
                            
                            await actions.updateTrackAction(track.id, { active: !track.active });
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                            track.active 
                            ? 'bg-white border-green-200 text-green-600 hover:border-red-200 hover:text-red-500 shadow-sm' 
                            : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 shadow-sm'
                          }`}
                        >
                          {track.active ? 'Ativo' : 'Inativo'}
                          {track.active ? <HiArrowUturnLeft size={12} /> : <Plus size={12} />}
                        </button>

                        <select 
                          value={track.objectiveId}
                          onChange={(e) => actions.updateTrackObjectiveAction(track.id, e.target.value)}
                          className="appearance-none bg-white border border-slate-400 text-s-700 text-[10px] font-black uppercase px-3 py-2 rounded-lg outline-none cursor-pointer tracking-widest shadow-sm hover:border-slate-800 transition-all"
                        >
                          {objectives.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <EditableDescription track={track} />
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 ml-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      setExpandedTrack(track.id);
                      await actions.createModuleAction(track.id);
                    }}
                    className="flex items-center gap-3 p-2 rounded-2xl border-2 border-dashed text-s-500 hover:text-s-800 transition-all w-full max-w-md group cursor-pointer"
                  >
                    <div className="rounded-xl transition-colors">
                      <Plus size={18} strokeWidth={3} />
                    </div>
                  </button>
                  <button onClick={() => confirm("Apagar trilha?") && actions.deleteTrackAction(track.id)} className="p-3 text-s-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
                    <LuTrash2 size={20} />
                  </button>
                  <button 
                    onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                    className="p-2 rounded-2xl transition-all bg-s-20 text-s-800 hover:bg-s-100"
                  >
                    <ChevronDown size={24} className={`transition-transform duration-300 cursor-pointer ${expandedTrack === track.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <div className="mt-4 border-t border-s-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-s-600">
                      Visibilidade da Trilha
                    </label>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {plans?.map((plan) => {
                      const hasAccess = track.subscriptionPlans?.some(
                        (spt: any) => spt.subscriptionPlanId === plan.id
                      );

                      return (
                        <button
                          key={plan.id}
                          onClick={() => actions.toggleTrackAccessAction(track.id, plan.id)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                            hasAccess 
                              ? "bg-green-500 border-green-600 text-white shadow-sm"
                              : "bg-s-50 border-s-20 text-s-800 opacity-60"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${hasAccess ? "bg-white" : "bg-s-50"}`} />
                          {plan.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {expandedTrack === track.id && (
              <div className="ml-10 space-y-2">
                {track.modules.map((module: any) => (
                  <div key={module.id} className="space-y-2 bg-s-100/50 p-4 pt-0 rounded-2xl">
                    <div 
                      onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)} 
                      className="bg-s-50/40 p-5 rounded-[28px] flex justify-between items-center cursor-pointer group/mod"
                    >
                      <h4 className="font-bold text-s-700 uppercase text-[13px]">{module.title}</h4>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            actions.toggleModulePremiumAction(module.id, module.isPremium);
                          }}
                          className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                            module.isPremium 
                            ? 'bg-amber-50 border-amber-200 text-amber-700' 
                            : 'bg-s-50 border-s-100 text-s-600'
                          }`}
                          title={module.isPremium ? 'Premium' : 'Grátis'}
                        >
                          {module.isPremium ? (
                            <div className="flex gap-2">
                              <LuLock size={12} strokeWidth={3} />
                              <span>Premium</span>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <LuLockOpen size={12} />
                              <span>Grátis</span>
                            </div>
                          )}
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            setExpandedModule(module.id);
                            
                            await actions.createLessonAction(module.id);
                            setExpandedModule(module.id);
                          }}
                          className="p-2 text-s-600 hover:bg-white rounded-xl transition-all opacity-0 group-hover/mod:opacity-100 cursor-pointer"
                        >
                          <Plus size={18} />
                        </button>
                        <Link href={`/admin/content/modules/${module.id}`} onClick={(e) => e.stopPropagation()} className="p-2 text-s-600 hover:bg-white rounded-xl transition-all"><FaArrowRightFromBracket size={18} /></Link>
                        <button onClick={(e) => { e.stopPropagation(); if(confirm("Excluir Módulo?")) actions.deleteModuleAction(module.id); }} className="p-2 text-s-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"><Trash2 size={18} /></button>
                        <ChevronRight size={20} className={`text-s-600 transition-transform ${expandedModule === module.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {expandedModule === module.id && (
                      <div className="ml-8 space-y-1 animate-in fade-in duration-200">
                        {module.lessons.map((lesson: any) => (
                          <div key={lesson.id} className="group/lesson bg-white border border-s-100/50 p-4 rounded-2xl flex justify-between items-center hover:border-s-50 transition-all">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => actions.toggleLessonPremiumAction(lesson.id, lesson.isPremium)}
                                className={`p-1.5 transition-colors ${
                                  lesson.isPremium ? 'text-amber-500 hover:text-amber-600' : 'text-s-500 hover:text-s-700 cursor-pointer'
                                }`}
                                title={lesson.isPremium ? "Conteúdo Premium" : "Conteúdo Gratuito"}
                              >
                                {lesson.isPremium ? <LuLock size={16} strokeWidth={3} /> : <LuLockOpen size={16} />}
                              </button>
                              <div className="w-1.5 h-1.5 rounded-full bg-s-400" />
                              <Link 
                                href={`/admin/content/modules/${module.id}/lessons/${lesson.id}`}
                                className="text-xs font-bold text-s-600 uppercase tracking-tight hover:text-[var(--interface-accent)] transition-colors"
                              >
                                {lesson.title}
                              </Link>
                            </div>

                            <div className="flex items-center gap-3 opacity-0 group-hover/lesson:opacity-100 transition-all">
                              <Link 
                                href={`/admin/content/modules/${module.id}/lessons/${lesson.id}`}
                                className="p-1.5 text-s-600 hover:bg-s-50"
                              >
                                <FaArrowRightFromBracket size={16} />
                              </Link>
                              <button 
                                onClick={() => { if(confirm("Excluir Aula?")) actions.deleteLessonAction(lesson.id); }} 
                                className="p-1.5 text-s-600 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
    </>
  );
}