"use client";

import { useState } from "react";
import { Bold, Italic, List, Heading2, Link, Quote, Eye, Pencil } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id: string;
}

export function MarkdownEditor({ value, onChange, placeholder, id }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(id) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || "";
    onChange(currentVal.substring(0, start) + prefix + currentVal.substring(start, end) + suffix + currentVal.substring(end));
    setTimeout(() => { textarea.focus(); }, 10);
  };

  return (
    <div className="w-full border rounded-[32px] overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between p-3 border-b bg-s-25/50">
        <div className="flex gap-1 bg-s-100 p-1 rounded-xl">
          <button type="button" onClick={() => setMode("edit")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'edit' ? 'bg-white text-s-900 shadow-sm' : 'text-s-400'}`}>
            <Pencil size={12} className="inline mr-1"/> Editar
          </button>
          <button type="button" onClick={() => setMode("preview")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'preview' ? 'bg-white text-s-900 shadow-sm' : 'text-s-400'}`}>
            <Eye size={12} className="inline mr-1"/> Visualizar
          </button>
        </div>

        {mode === "edit" && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => insertMarkdown("## ")} className="p-2 hover:bg-white rounded-lg text-s-500"><Heading2 size={16}/></button>
            <button type="button" onClick={() => insertMarkdown("**", "**")} className="p-2 hover:bg-white rounded-lg text-s-500 font-bold"><Bold size={16}/></button>
            <button type="button" onClick={() => insertMarkdown("- ")} className="p-2 hover:bg-white rounded-lg text-s-500"><List size={16}/></button>
          </div>
        )}
      </div>

      {mode === "edit" ? (
        <textarea 
          id={id}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-8 min-h-[400px] outline-none text-s-700 font-medium resize-none bg-transparent text-lg"
        />
      ) : (
        <div className="p-8 min-h-[400px] bg-white">
          <div className="max-w-none prose prose-slate prose-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || "*Nada para visualizar ainda...*"}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}