import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical, Plus } from "lucide-react";
import { useRef } from "react";

interface SortableObjectiveItemProps {
  o: any;
  activeObjectiveId: string | null;
  setActiveObjectiveId: (id: string | null) => void;
  handleUpdateObjectiveName: (id: string, name: string) => void;
  setHasChanges: (val: boolean) => void;
  setLocalObjectives: React.Dispatch<React.SetStateAction<any[]>>;
  markForDeletion: (type: 'objective' | 'track' | 'module' | 'lesson', id: string) => void;
  isMarkedForDeletion?: boolean;
  objectivesLength: number;
}


export function SortableObjectiveItem({ o, activeObjectiveId, setActiveObjectiveId, handleUpdateObjectiveName, markForDeletion, setLocalObjectives, setHasChanges, isMarkedForDeletion, objectivesLength }: SortableObjectiveItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: o.id });

  const colorInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  const handleColorChange = (color: string) => {
    setLocalObjectives(prev => prev.map(item => 
      item.id === o.id ? { ...item, color: color } : item
    ));
    setHasChanges(true);
  };

  const handleNameChange = (name: string) => {
    setLocalObjectives(prev => prev.map(item => 
      item.id === o.id ? { ...item, name: name } : item
    ));
    setHasChanges(true);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center group/obj transition-all ${
        isDragging ? "opacity-50 scale-105 z-50" : "opacity-100"
      }`}
    >
      <div
        className={`flex items-center gap-2 pl-3 pr-4 rounded-full transition-all cursor-pointer w-50 ${
          activeObjectiveId === o.id ? 'bg-s-50' : 'hover:bg-s-50/50'
        }`}
      >
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-s-400 hover:text-s-600">
          <GripVertical size={14} />
        </div>

        <div className="relative group/color">
          <div 
            className="w-3 h-3 rounded-full shadow-xs border border-black/5"
            style={{ backgroundColor: o.color || '#3b82f6' }}
          />
          <input 
            ref={colorInputRef}
            type="color"
            value={o.color || '#3b82f6'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <input
          type="text"
          value={o.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={`pr-6 py-4 font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all whitespace-nowrap bg-transparent border-none outline-none focus:ring-0 ${
            activeObjectiveId === o.id ? 'text-interface-accent' : 'text-s-600'
          }`}
          onClick={() => setActiveObjectiveId(o.id)}
        />
        
        {activeObjectiveId === o.id && (
          <div className="absolute bottom-0 left-0 w-[calc(100%-1.5rem)] h-[3px] bg-interface-accent rounded-t-full" />
        )}
      </div>

      {objectivesLength > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            markForDeletion('objective', o.id);
          }}
          className={`p-1 mr-2 rounded-lg transition-colors cursor-pointer ${
            isMarkedForDeletion ? 'text-red-500 bg-red-50' : 'text-s-300 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}