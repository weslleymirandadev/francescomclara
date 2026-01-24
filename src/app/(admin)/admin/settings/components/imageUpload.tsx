"use client";

import { useState, useRef } from "react";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";

interface ImageUploadProps {
  value: string;
  field: string;
  onChange: (field: string, value: string) => void;
  label: string;
  maxDimension?: number;
}

export function ImageUpload({ value, field, onChange, label, maxDimension }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(field, ""); 
  };

  const handleFile = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (maxDimension && (img.width > maxDimension || img.height > maxDimension)) {
          alert(`Erro: A imagem excede ${maxDimension}x${maxDimension}px.`);
          return;
        }
        onChange(field, e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 flex-1">
      <div className="flex justify-between items-end px-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {label}
        </label>
        {value && (
          <button 
            type="button"
            onClick={handleRemove}
            className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline cursor-pointer"
          >
            Remover
          </button>
        )}
      </div>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative h-44 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden
          ${isDragging 
            ? "border-[var(--clara-rose)] bg-pink-50 scale-[0.98]" 
            : "border-slate-200 bg-slate-50 hover:bg-white hover:border-[var(--clara-rose)]"}
        `}
      >
        {value ? (
          <div className="relative group w-full h-full flex items-center justify-center p-8 bg-white">
            <img 
              src={value?.startsWith('data:') ? value : value}
              key={value}
              alt="Preview" 
              className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-500"
              onError={(e) => {
                console.error("Erro ao carregar preview:", value);
              }}
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
               <p className="text-[9px] font-black text-slate-900 bg-white/90 px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest">
                 Trocar Arquivo
               </p>
            </div>
          </div>
        ) : (
          <div className="text-center group">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FiUploadCloud size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Solte seu SVG/PNG</p>
            {maxDimension && (
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Máx: {maxDimension}x{maxDimension}px</p>
            )}
          </div>
        )}

        <input 
          ref={fileInputRef} 
          type="file" 
          className="hidden" 
          accept=".svg,.png" 
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
        />
      </div>
    </div>
  );
}