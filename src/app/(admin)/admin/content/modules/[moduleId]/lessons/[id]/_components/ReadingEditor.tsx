"use client";

import { FileText } from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";

export function ReadingEditor({ content, onChange }: { content: any; onChange: (newContent: any) => void }) {
  const data = content || { description: "" };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 border-b pb-6">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
          <FileText size={20} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-tight text-s-800">Texto de Leitura</h3>
      </div>

      <MarkdownEditor 
        id="reading-markdown"
        value={data.description || ""}
        onChange={(val) => onChange({ ...data, description: val })}
        placeholder="Escreva o texto base da aula..."
      />
    </div>
  );
}