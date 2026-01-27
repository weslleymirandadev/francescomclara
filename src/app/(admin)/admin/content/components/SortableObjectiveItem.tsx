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

const PRESET_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#f472b6", "#0f172a"];

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

      <div className="relative flex items-center gap-4 flex-1">
        <input 
          type="color"
          ref={colorInputRef}
          value={o.color || "#3b82f6"}
          onChange={(e) => handleColorChange(e.target.value)}
          className="absolute invisible w-0 h-0"
        />

        <div className="relative group/color-picker">
          <button
            onClick={() => colorInputRef.current?.click()}
            className="w-4 h-4 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-125 cursor-pointer"
            style={{ backgroundColor: o.color || '#3b82f6' }}
            title="Escolher cor hexadecimal"
          />

          <div className="absolute top-full left-0 mt-3 bg-white p-3 shadow-2xl rounded-2xl border border-s-50 hidden group-hover/color-picker:grid grid-cols-4 gap-2 z-50 animate-in fade-in zoom-in duration-200">
            {PRESET_COLORS.map(c => (
              <button 
                key={c}
                onClick={() => handleColorChange(c)}
                className="w-5 h-5 rounded-lg border border-black/5 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
            <button 
              onClick={() => colorInputRef.current?.click()}
              className="w-5 h-5 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-interface-accent hover:text-interface-accent transition-all"
            >
              <Plus size={10} strokeWidth={4} />
            </button>
          </div>
        </div>

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