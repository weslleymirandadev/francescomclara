import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";

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

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center h-full shrink-0 snap-start transition-all ${ 
        isDragging ? 'opacity-50' : ''
      } ${
        isMarkedForDeletion ? 'opacity-30 grayscale bg-red-50/50' : ''
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="pl-4 pr-2 py-4 cursor-grab active:cursor-grabbing text-s-400 hover:text-interface-accent transition-colors"
      >
        <GripVertical size={16} />
      </div>

      <div className="relative flex items-center h-full">
        <input
          type="text"
          value={o.name}
          onChange={(e) => {
            const newName = e.target.value;
            setLocalObjectives(prev => prev.map(item => 
              item.id === o.id ? { ...item, name: newName } : item
            ));
            setHasChanges(true);
          }}
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
            isMarkedForDeletion ? 'bg-red-500 text-white' : 'text-s-400 hover:text-red-500'
          }`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}