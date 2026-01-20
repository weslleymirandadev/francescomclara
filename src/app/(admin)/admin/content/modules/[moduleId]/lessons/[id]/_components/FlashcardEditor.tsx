"use client";

import { Plus, Trash2, BrainCircuit } from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardEditorProps {
  content: any;
  onChange: (newContent: any) => void;
}

export function FlashcardEditor({ content, onChange }: FlashcardEditorProps) {
  // Inicializa como array vazio se não houver conteúdo
  const cards: Flashcard[] = Array.isArray(content) ? content : [];

  const updateCard = (index: number, field: keyof Flashcard, value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    onChange(newCards);
  };

  const addCard = () => {
    onChange([...cards, { front: "", back: "" }]);
  };

  const removeCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    onChange(newCards);
  };

  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-s-100 pb-6">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tighter text-s-800">
            Cartões de Memorização
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-s-400 mt-1">
            {cards.length} {cards.length === 1 ? 'cartão criado' : 'cartões criados'}
          </p>
        </div>
        <button
          onClick={addCard}
          className="flex items-center gap-2 px-6 py-3 bg-s-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-s-900/20"
        >
          <Plus size={16} strokeWidth={3} />
          Adicionar Card
        </button>
      </div>

      <div className="grid gap-4">
        {cards.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-s-50 rounded-[32px] bg-s-25/30">
            <BrainCircuit size={40} className="mx-auto text-s-100 mb-4" />
            <p className="text-s-300 font-bold italic text-sm">Nenhum cartão adicionado ainda.</p>
          </div>
        ) : (
          cards.map((card, index) => (
            <div 
              key={index} 
              className="group relative grid grid-cols-1 md:grid-cols-2 gap-4 bg-s-50/50 p-6 rounded-[32px] border border-transparent hover:border-s-100 hover:bg-white transition-all"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-s-300 ml-1">Frente (Pergunta)</label>
                <textarea
                  value={card.front}
                  onChange={(e) => updateCard(index, "front", e.target.value)}
                  className="w-full p-4 bg-white border border-s-100 rounded-2xl font-bold text-s-700 text-sm outline-none focus:ring-2 focus:ring-interface-accent/10 resize-none h-24"
                  placeholder="Ex: Comment dit-on 'Bonjour'?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-s-300 ml-1">Verso (Resposta)</label>
                <textarea
                  value={card.back}
                  onChange={(e) => updateCard(index, "back", e.target.value)}
                  className="w-full p-4 bg-white border border-s-100 rounded-2xl font-bold text-s-700 text-sm outline-none focus:ring-2 focus:ring-interface-accent/10 resize-none h-24"
                  placeholder="Ex: Como se diz 'Bom dia'?"
                />
              </div>

              <button
                onClick={() => removeCard(index)}
                className="absolute -right-2 -top-2 w-8 h-8 bg-white border border-rose-100 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}