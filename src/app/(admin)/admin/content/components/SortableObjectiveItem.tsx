import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";

interface SortableObjectiveItemProps {
  o: any;
  activeObjectiveId: string | null;
  setActiveObjectiveId: (id: string | null) => void;
  handleDeleteObjective: (type: 'objective' | 'track' | 'module' | 'lesson', id: string) => void;
  handleUpdateObjectiveName: (id: string, name: string) => void;
  objectivesLength: number;
}

export function SortableObjectiveItem({ o, activeObjectiveId, setActiveObjectiveId, handleDeleteObjective, handleUpdateObjectiveName, objectivesLength }: SortableObjectiveItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: o.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center h-full shrink-0 snap-start ${isDragging ? 'opacity-50' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="pl-4 pr-2 py-4 cursor-grab active:cursor-grabbing text-s-400 hover:text-interface-accent transition-colors"
      >
        <GripVertical size={16} />
      </div>

      <button
        onClick={() => setActiveObjectiveId(o.id)}
        className={`pr-6 py-4 font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all whitespace-nowrap relative ${
          activeObjectiveId === o.id ? 'text-interface-accent' : 'text-s-600'
        }`}
      >
        {o.name}
        {activeObjectiveId === o.id && (
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-interface-accent rounded-t-full" />
        )}
      </button>

      {objectivesLength > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleDeleteObjective('objective', o.id); }}
          className="absolute -top-1 -right-1 md:opacity-0 md:group-hover:opacity-100 bg-red-500 text-white rounded-full p-0.5 transition-all shadow-sm"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}