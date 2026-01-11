"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Check, X } from "lucide-react";
import ObjectiveBanner from "./ObjectiveBanner";
import * as actions from "./actions";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToHorizontalAxis,restrictToParentElement } from "@dnd-kit/modifiers";
import { StaticAddButton } from './components/StaticAddButton';
import { SortableObjectiveItem } from './components/SortableObjectiveItem';
import { SortableTrackItem } from './components/SortableTrackItem';
import { SortableModuleItem  } from "./components/SortableModuleItem";
import { EditableName } from './components/EditableName';
import { EditableDescription } from './components/EditableDescription';

export default function ContentList({ tracks, configs, plans }: { tracks: any[], configs: any[], plans: any[] }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const activeTrackIdFromUrl = searchParams.get('track');
  const [openTracks, setOpenTracks] = useState<string[]>(activeTrackIdFromUrl ? [activeTrackIdFromUrl] : []);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [objectives, setObjectives] = useState(configs);
  const [localTracks, setLocalTracks] = useState(tracks);
  const [localObjectives, setLocalObjectives] = useState<any[]>(objectives);
  const [activeObjectiveId, setActiveObjectiveId] = useState<string | null>(objectives[0]?.id || null);
  const activeObjective = localObjectives.find(o => o.id === activeObjectiveId);
  const tracksInObjective = localTracks.filter(t => t.objectiveId === activeObjectiveId);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    const saved = localStorage.getItem('openTracks');
    if (saved) {
      setOpenTracks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (tracks) {
      setLocalTracks(tracks);
      
      if (configs && configs.length > 0) {
        setLocalObjectives(configs);
      } else {
        const uniqueObjectives = Array.from(
          new Map(
            tracks
              .filter(t => t.objective)
              .map((t) => [t.objective.id, t.objective])
          ).values()
        );
        setLocalObjectives(uniqueObjectives);
      }
      
      setLoading(false);
    }
  }, [tracks, configs]);

  const handleTrackNameChange = (trackId: string, newName: string) => {
    setLocalTracks(prev => prev.map(t => t.id === trackId ? { ...t, name: newName } : t));
    setHasChanges(true);
  };

  const handleTrackDescriptionChange = (trackId: string, newDescription: string) => {
    setLocalTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, description: newDescription } : t
    ));
    setHasChanges(true);
  };

  const handleModuleTitleChange = (moduleId: string, newTitle: string) => {
    setLocalTracks(prev => prev.map(t => ({
      ...t,
      modules: t.modules?.map((m: any) => 
        m.id === moduleId ? { ...m, title: newTitle } : m
      )
    })));
    setHasChanges(true);
  };

  const handleLessonTitleChange = (lessonId: string, newTitle: string) => {
    setLocalTracks(prev => prev.map(t => ({
      ...t,
      modules: t.modules?.map((m: any) => ({
        ...m,
        lessons: m.lessons?.map((l: any) => 
          l.id === lessonId ? { ...l, title: newTitle } : l
        )
      }))
    })));
    setHasChanges(true);
  };

  const handleCreateModuleLocal = (trackId: string) => {
    const tempId = `temp-${Date.now()}`;
    const newModule = {
      id: tempId,
      title: "Novo Módulo",
      lessons: [],
      trackId: trackId,
      isTemp: true
    };

    setLocalTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return { ...t, modules: [...(t.modules || []), newModule] };
      }
      return t;
    }));
    
    setHasChanges(true);
    return newModule;
  };

  const handleCreateLessonLocal = (moduleId: string) => {
    const tempId = `temp-lesson-${Date.now()}`;
    const newLesson = { id: tempId, title: "Nova Aula (Rascunho)", isPremium: false, isTemp: true };

    setLocalTracks(prev => prev.map(t => ({
      ...t,
      modules: t.modules?.map((m: any) => {
        if (m.id === moduleId) {
          return { ...m, lessons: [...(m.lessons || []), newLesson] };
        }
        return m;
      })
    })));
    setHasChanges(true);
  };

  const markForDeletion = (type: 'objective' | 'track' | 'module' | 'lesson', id: string) => {
    if (!id) return;

    // 1. Lógica para itens que já existem no Banco de Dados (Não começam com temp-)
    if (typeof id === 'string' && !id.startsWith('temp-')) {
      setItemsToDelete(prev => ({
        ...prev,
        [type === 'objective' ? 'objectives' : 
        type === 'track' ? 'tracks' : 
        type === 'module' ? 'modules' : 'lessons']: 
          [...prev[type === 'objective' ? 'objectives' : type === 'track' ? 'tracks' : type === 'module' ? 'modules' : 'lessons'], id]
      }));
    }

    // 2. Remoção visual do estado local
    if (type === 'objective') {
      setLocalObjectives(prev => {
        const filtered = prev.filter(o => o.id !== id);
        
        if (activeObjectiveId === id && filtered.length > 0) {
          setActiveObjectiveId(filtered[0].id);
        }
        return filtered;
      });
    } else {
      setLocalTracks(prev => {
        if (type === 'track') return prev.filter(t => t.id !== id);

        return prev.map((t: any) => ({
          ...t,
          modules: t.modules?.filter((m: any) => {
            if (type === 'module' && m.id === id) return false;
            return true;
          }).map((m: any) => ({
            ...m,
            lessons: m.lessons?.filter((l: any) => !(type === 'lesson' && l.id === id))
          }))
        }));
      });
    }

    setHasChanges(true);
  };

  const handleUpdateObjectiveName = (id: string, newName: string) => {
    setLocalObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, name: newName } : obj))
    );
    
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const response = await actions.saveContentBulkAction(localTracks, itemsToDelete, localObjectives);

      if (response && response.success) {
        setItemsToDelete({ tracks: [], modules: [], lessons: [], objectives: [] });
        setHasChanges(false);
        router.refresh();
        toast.success("Salvo com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const [itemsToDelete, setItemsToDelete] = useState<{
    tracks: string[];
    modules: string[];
    lessons: string[];
    objectives: string[];
  }>({
    tracks: [],
    modules: [],
    lessons: [],
    objectives: [],
  });

  const handleDiscardChanges = () => {
    if (confirm("Deseja descartar todas as alterações não salvas?")) {
      setLocalObjectives(objectives);
      setLocalTracks(tracks);
      setItemsToDelete({ tracks: [], modules: [], lessons: [], objectives: [] });
      setHasChanges(false);
    }
  };

  const handleAddObjective = () => {
    const name = prompt("Nome do novo objetivo:");
    if (name) {
      const tempId = `temp-${Date.now()}`;
      const newObj = { id: tempId, name: name };
      
      setLocalObjectives(prev => [...prev, newObj]);
      setActiveObjectiveId(tempId);
      setHasChanges(true);
    }
  };


  const handleUpdateObjectiveSettings = (
    id: string, 
    settings: { icon?: string; iconRotate?: number; rotation?: number; imageUrl?: string }
  ) => {
    setLocalObjectives(prev => prev.map(obj => {
      if (obj.id === id) {
        const newRotation = settings.rotation !== undefined ? settings.rotation : (obj.rotation || 0);
        return { 
          ...obj, 
          ...settings,
          rotation: newRotation,
          iconRotate: newRotation * -1 
        };
      }
      return obj;
    }));
    setHasChanges(true);
  };

  const handleDragEnd = (event: DragEndEvent, trackId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalTracks((prev) =>
        prev.map((t) => {
          if (t.id === trackId) {
            const oldIndex = t.modules.findIndex((m: any) => m.id === active.id);
            const newIndex = t.modules.findIndex((m: any) => m.id === over.id);

            return {
              ...t,
              modules: arrayMove(t.modules, oldIndex, newIndex),
            };
          }
          return t;
        })
      );
      setHasChanges(true);
    }
  };

  const handleObjectiveDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    let overId = over.id;
    if (overId === 'add-button-id') {
      const lastObjective = localObjectives[localObjectives.length - 1];
      overId = lastObjective.id;
    }

    if (active.id !== overId) {
      setLocalObjectives((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === overId);

        const reorderedList = arrayMove(items, oldIndex, newIndex);

        return reorderedList.map((obj, index) => ({
          ...obj,
          order: index,
        }));
      });
      setHasChanges(true);
    }
  };

  const handleTrackDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalTracks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id);
      const newIndex = prev.findIndex((t) => t.id === over.id);
      
      const reorderedArray = arrayMove(prev, oldIndex, newIndex);

      return reorderedArray.map((track, index) => ({
        ...track,
        order: index
      }));
    });
    
    setHasChanges(true);
  };

  const handleLessonDragEnd = (event: DragEndEvent, moduleId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalTracks(prev => prev.map(track => ({
      ...track,
      modules: track.modules?.map((mod: any) => {
        if (mod.id !== moduleId) return mod;
        
        const oldIndex = mod.lessons.findIndex((l: any) => l.id === active.id);
        const newIndex = mod.lessons.findIndex((l: any) => l.id === over.id);
        
        return {
          ...mod,
          lessons: arrayMove(mod.lessons, oldIndex, newIndex)
        };
      })
    })));
    setHasChanges(true);
  };

  const handleToggleLessonLock = (lessonId: string) => {
    setLocalTracks(prev => prev.map(track => ({
      ...track,
      modules: track.modules?.map((mod: any) => ({
        ...mod,
        lessons: mod.lessons?.map((lesson: any) => 
          lesson.id === lessonId ? { ...lesson, locked: !lesson.locked } : lesson
        )
      }))
    })));
    setHasChanges(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-s-50)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--clara-rose)]"></div>
      </div>
    );
  }
    
  return (
    <>
      {hasChanges && (
        <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 md:gap-2 bg-s-900 border border-white/10 p-1.5 md:p-2 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 w-[90%] md:w-auto justify-center">
          <button
            onClick={handleDiscardChanges}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl font-black text-[9px] md:text-[11px] uppercase tracking-widest text-white/50 hover:text-white transition-all disabled:opacity-50"
          >
            <X size={14} className="md:size-4" />
            <span className="hidden xs:inline">Descartar</span>
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 bg-interface-accent px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-black text-[9px] md:text-[11px] uppercase tracking-widest text-s-950 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="animate-spin h-3 w-3 md:h-4 md:w-4 border-2 border-s-950/30 border-t-s-950 rounded-full" />
            ) : (
              <Check size={16} className="md:size-5" />
            )}
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      )}

      <div className="space-y-6 md:space-y-8 mb-12 px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-s-50 pb-4 gap-4">
          <nav className="flex items-center w-full md:max-w-[calc(100vw-400px)] relative overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide flex items-center w-full pb-2 p-2 md:pb-0 snap-x">
              {mounted ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter} 
                  onDragEnd={handleObjectiveDragEnd}
                  modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
                  autoScroll={false}
                >
                  <SortableContext 
                    items={[...localObjectives.map(o => o.id), 'add-button-id']}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex items-center snap-start">
                      {localObjectives.map((o) => (
                        <SortableObjectiveItem 
                          key={o.id}
                          o={o}
                          activeObjectiveId={activeObjectiveId}
                          setActiveObjectiveId={setActiveObjectiveId}
                          handleDeleteObjective={markForDeletion}
                          handleUpdateObjectiveName={handleUpdateObjectiveName}
                          objectivesLength={localObjectives.length}
                        />
                      ))}
                      <div className="flex-shrink-0 pr-4">
                        <StaticAddButton onClick={handleAddObjective} />
                      </div>
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex items-center opacity-50">
                  {localObjectives.map((o: any) => (
                    <div key={o.id} className="px-4 py-2 font-black text-[10px] uppercase whitespace-nowrap">
                      {o.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <button 
            onClick={() => {
              if (!activeObjectiveId) return alert("⚠️ Selecione um Objetivo primeiro.");
              const tempId = `temp-track-${Date.now()}`;
              const newTrack = {
                id: tempId,
                name: "Nova Trilha",
                description: "",
                active: false,
                objectiveId: activeObjectiveId,
                modules: [],
                subscriptionPlans: [],
                isTemp: true
              };
              setLocalTracks(prev => [newTrack, ...prev]);
              setHasChanges(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-full md:w-auto md:min-w-[250px] bg-s-900 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
              !activeObjectiveId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black shadow-s-900/20'
            }`}
          >
            + Nova Trilha {activeObjective?.name ? `em ${activeObjective.name}` : ''}
          </button>
        </div>

        <section key={activeObjectiveId} className="space-y-4 md:space-y-5">
          <ObjectiveBanner 
            objective={activeObjective} 
            onSettingsChange={(settings) => activeObjectiveId && handleUpdateObjectiveSettings(activeObjectiveId, settings)}
          />
          
          <div className="space-y-4 relative z-40 pb-20">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleTrackDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext items={tracksInObjective.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {tracksInObjective.map((track) => (
                  <SortableTrackItem
                    key={track.id}
                    track={track}
                    configs={configs}
                    plans={plans}
                    openTracks={openTracks}
                    setOpenTracks={setOpenTracks}
                    setLocalTracks={setLocalTracks}
                    setHasChanges={setHasChanges}
                    markForDeletion={markForDeletion}
                    handleCreateModuleLocal={handleCreateModuleLocal}
                    setExpandedModule={setExpandedModule}
                    handleTrackNameChange={handleTrackNameChange}
                    handleTrackDescriptionChange={handleTrackDescriptionChange}
                    EditableName={EditableName}
                    EditableDescription={EditableDescription}
                    handleLessonDragEnd={handleLessonDragEnd}
                    handleToggleLessonLock={handleToggleLessonLock}
                    handleUpdateLessonName={handleLessonTitleChange}
                    renderModules={(t) => (
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleDragEnd(e, t.id)}
                        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                      >
                        <SortableContext 
                          items={t.modules?.map((m: any) => m.id) || []} 
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="grid grid-cols-1 gap-3 md:gap-4 mt-2">
                            {t.modules?.map((module: any) => (
                              <SortableModuleItem
                                key={module.id}
                                module={module}
                                expandedModule={expandedModule}
                                setExpandedModule={setExpandedModule}
                                markForDeletion={markForDeletion}
                                handleUpdateModuleName={handleModuleTitleChange}
                                handleCreateLessonLocal={handleCreateLessonLocal}
                                handleLessonDragEnd={handleLessonDragEnd}
                                handleToggleLessonLock={handleToggleLessonLock}
                                handleUpdateLessonName={handleLessonTitleChange}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </section>
      </div>
    </>
  );
}