"use client";

import { Plus, Trash2, BrainCircuit } from "lucide-react";

// Adicionamos 'availableLessons' nas props
interface FlashcardEditorProps {
  content: any;
  onChange: (newContent: any) => void;
  availableLessons?: { id: string; title: string }[]; 
}

export function FlashcardEditor({ content, onChange, availableLessons = [] }: FlashcardEditorProps) {
  const cards: any[] = Array.isArray(content) ? content : [];

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    onChange(newCards);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
            <BrainCircuit size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-s-800">Flashcards</h3>
        </div>
        <button 
          type="button"
          onClick={() => onChange([...cards, { front: "", back: "", relatedLessonId: "" }])}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-s-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          <Plus size={14} /> Adicionar Card
        </button>
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <div key={index} className="relative grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-s-25 border rounded-2xl group">
            
            {/* Campo Frente */}
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-s-300 ml-1">Frente</span>
              <textarea
                value={card.front}
                onChange={(e) => updateCard(index, "front", e.target.value)}
                className="w-full p-3 bg-white border rounded-xl text-sm outline-none h-20 resize-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Campo Verso */}
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-s-300 ml-1">Verso</span>
              <textarea
                value={card.back}
                onChange={(e) => updateCard(index, "back", e.target.value)}
                className="w-full p-3 bg-white border rounded-xl text-sm outline-none h-20 resize-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* SELETOR DE CORRELAÇÃO - Onde a mágica acontece */}
            <div className="md:col-span-2 space-y-1 border-t pt-2 mt-1">
              <span className="text-[9px] font-black uppercase text-s-400 ml-1">Liberar este card após a aula:</span>
              <select
                value={card.relatedLessonId || ""}
                onChange={(e) => updateCard(index, "relatedLessonId", e.target.value)}
                className="w-full p-2 bg-white border rounded-lg text-[11px] outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Sempre disponível (Imediato)</option>
                {availableLessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => onChange(cards.filter((_, i) => i !== index))}
              className="md:absolute -right-2 -top-2 w-full md:w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {cards.length === 0 && (
          <div className="py-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-s-300">
            <p className="text-xs font-medium">Nenhum flashcard adicionado a esta aula.</p>
          </div>
        )}
      </div>
    </div>
  );
}