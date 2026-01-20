import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";

export function StaticAddButton({ onClick }: { onClick: () => void }) {
  const { setNodeRef, transform, transition } = useSortable({
    id: 'add-button-id',
    disabled: true,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center shrink-0 ml-2 border-l border-s-50">
      <button 
        onClick={onClick}
        className="p-4 text-s-300 hover:text-interface-accent transition-colors cursor-pointer"
        title="Adicionar novo objetivo"
      >
        <Plus size={18} strokeWidth={3} />
      </button>
    </div>
  );
}