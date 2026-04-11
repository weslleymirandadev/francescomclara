"use client";

import { useState, useEffect } from "react";
import { FileText, MessageSquare } from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";
import { SentenceEditor } from "./SentenceEditor";

export function ReadingEditor({ content, onChange }: { content: any; onChange: (newContent: any) => void }) {
  const [mode, setMode] = useState<'traditional' | 'sentences'>('sentences');
  const data = content || { description: "", sentences: [] };

  const hasSentences = data.sentences && Array.isArray(data.sentences) && data.sentences.length > 0;
  const hasTraditionalText = data.description && data.description.trim().length > 0;

  // Auto-detect mode based on content
  useEffect(() => {
    if (hasSentences && !hasTraditionalText) {
      setMode('sentences');
    } else if (hasTraditionalText && !hasSentences) {
      setMode('traditional');
    }
  }, [hasSentences, hasTraditionalText]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
            <FileText size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Texto de Leitura</h3>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setMode('traditional')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
              mode === 'traditional'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={14} />
              <span>Tradicional</span>
            </div>
          </button>
          <button
            onClick={() => setMode('sentences')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
              mode === 'sentences'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={14} />
              <span>Frases Interativas</span>
            </div>
          </button>
        </div>
      </div>

      {mode === 'traditional' ? (
        <div>
          <MarkdownEditor 
            id="reading-markdown"
            value={data.description || ""}
            onChange={(val) => onChange({ ...data, description: val })}
            placeholder="Escreva o texto base da aula..."
          />
          
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-700">
              💡 <strong>Modo Tradicional:</strong> Use este modo para textos simples. 
              Para criar frases interativas com áudio e explicações, mude para "Frases Interativas".
            </p>
          </div>
        </div>
      ) : (
        <SentenceEditor 
          content={data}
          onChange={onChange}
        />
      )}
    </div>
  );
}