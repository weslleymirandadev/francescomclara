"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
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
import { SaveChangesBar } from "@/components/ui/savechangesbar";
import { Loading } from   '@/components/ui/loading'

export default function ContentList({ tracks, configs, plans }: { tracks: any[], configs: any[], plans: any[] }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const activeTrackIdFromUrl = searchParams.get('track');
  const [openTracks, setOpenTracks] = useState<string[]>(activeTrackIdFromUrl ? [activeTrackIdFromUrl] : []);
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

    const category = type === 'objective' ? 'objectives' : 
                    type === 'track' ? 'tracks' : 
                    type === 'module' ? 'modules' : 'lessons';

    setItemsToDelete(prev => {
      const currentList = prev[category] || [];
      const exists = currentList.includes(id);
      
      return {
        ...prev,
        [category]: exists 
          ? currentList.filter(itemId => itemId !== id) 
          : [...currentList, id]
      };
    });

    
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
      const result = await actions.saveContentBulkAction(
        localTracks,      // 1º argumento
        itemsToDelete,    // 2º argumento
        localObjectives   // 3º argumento
      );

      if (result.success) {
        toast.success("Alterações salvas com sucesso!");
        setItemsToDelete({ tracks: [], modules: [], lessons: [], objectives: [] });
        setHasChanges(false);
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro crítico ao salvar");
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

  const handleToggleModuleLock = (moduleId: string) => {
    setLocalTracks(prev => prev.map(track => ({
      ...track,
      modules: track.modules?.map((m: any) => 
        m.id === moduleId ? { ...m, isPremium: !m.isPremium } : m
      )
    })));
    setHasChanges(true);
  };

  const handleToggleLessonLock = (lessonId: string) => {
    setLocalTracks(prev => prev.map(track => ({
      ...track,
      modules: track.modules?.map((mod: any) => ({
        ...mod,
        lessons: mod.lessons?.map((lesson: any) => 
          lesson.id === lessonId ? { ...lesson, isPremium: !lesson.isPremium } : lesson
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

  if (loading) return <Loading />;
    
  return (
    <main className="w-full overflow-x-hidden animate-in fade-in duration-700">
      <SaveChangesBar 
        hasChanges={hasChanges}
        loading={loading}
        onSave={handleSaveAll}
        onDiscard={handleDiscardChanges}
        saveText="Enregistrer"
      />

      <div className="max-w-6xl mx-auto px-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-(--slate-50) pb-4 gap-6">
          <nav className="flex items-center w-full md:max-w-[calc(100vw-700px)] min-w-0 relative overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide flex w-full snap-x touch-pan-x">
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
                    <div className="flex items-center max-w-[95vw]">
                      {localObjectives.map((o) => (
                        <SortableObjectiveItem 
                          key={o.id}
                          o={o}
                          activeObjectiveId={activeObjectiveId}
                          setActiveObjectiveId={setActiveObjectiveId}
                          markForDeletion={markForDeletion}
                          isMarkedForDeletion={itemsToDelete.objectives.includes(o.id)}
                          handleUpdateObjectiveName={handleUpdateObjectiveName}
                          objectivesLength={localObjectives.length}
                          setLocalObjectives={setLocalObjectives}
                          setHasChanges={setHasChanges}
                        />
                      ))}
                      <div className="shrink-0 pr-10">
                        <StaticAddButton onClick={handleAddObjective} />
                      </div>
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex items-center opacity-50 min-w-max">
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
            className={`md:w-auto md:min-w-[250px] bg-s-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer ${
              !activeObjectiveId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black shadow-s-900/20'
            }`}
          >
            + Nova Trilha {activeObjective?.name ? `em ${activeObjective.name}` : ''}
          </button>
        </div>

        <section key={activeObjectiveId} className="space-y-6 mt-8">
          <ObjectiveBanner 
            objective={activeObjective} 
            onSettingsChange={(settings) => activeObjectiveId && handleUpdateObjectiveSettings(activeObjectiveId, settings)}
            setLocalObjectives={setLocalObjectives}
            setHasChanges={setHasChanges}
          />
          
          <div className="space-y-4 relative z-40 pb-32">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleTrackDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext items={tracksInObjective.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 gap-6">
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
                      handleToggleModuleLock={handleToggleModuleLock}
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
                                  handleToggleModuleLock={handleToggleModuleLock}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </section>
      </div>
    </main>
  );
}