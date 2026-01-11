import React, { useState, useEffect } from 'react';
import { LuPencil } from "react-icons/lu";

export const EditableDescription = ({ track, onValueChange }: { track: any, onValueChange: (id: string, val: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(track.description);

  useEffect(() => {
    setValue(track.description);
  }, [track.description]);

  return (
    <div className="relative max-w-3xl group/desc">
      <textarea 
        id={`desc-${track.id}`}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onValueChange(track.id, e.target.value);
        }}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        placeholder='Escreva a descrição da trilha aqui.'
        className={`w-full bg-white/20 border rounded-2xl p-4 text-s-700 text-sm font-medium leading-relaxed focus:ring-0 transition-all min-h-[100px] pr-14 resize-none shadow-inner ${
          isEditing ? 'border-[var(--interface-accent)]' : 'border-s-50'
        }`}
      />
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {isEditing && (
          <button 
            onMouseDown={(e) => e.preventDefault()}
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