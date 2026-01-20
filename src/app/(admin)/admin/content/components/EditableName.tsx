import { useState, useEffect } from 'react';
import { LuPencil } from "react-icons/lu";

export const EditableName = ({ track, onNameChange }: { track: any, onNameChange: (id: string, newName: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(track.name);

  useEffect(() => {
    setValue(track.name);
  }, [track.name]);

  return (
    <div className="relative flex-1 group/name flex items-center gap-3 w-full min-w-0">
      <input 
        id={`name-${track.id}`}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onNameChange(track.id, e.target.value);
        }}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        className={`font-black uppercase text-2xl md:text-3xl tracking-tighter font-frenchpress bg-transparent border-none focus:ring-0 p-0 flex-1 min-w-0 transition-colors ${
          isEditing ? 'text-[var(--interface-accent)]' : 'text-s-800'
        }`}
      />
      {!isEditing && (
        <div className="opacity-0 group-hover/name:opacity-100 p-2 text-s-400">
          <LuPencil size={16} />
        </div>
      )}
    </div>
  );
};