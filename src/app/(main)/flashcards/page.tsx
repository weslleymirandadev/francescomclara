"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FiLayers, FiCheck, FiX, FiArrowLeft } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Loading } from "@/components/ui/loading";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  lesson?: {
    title: string;
    module: {
      track: {
        name: string;
      }
    }
  }
};

const DEMO_CARDS: Flashcard[] = [
  { id: "1", front: "Bonjour", back: "Olá / Bom dia" },
  { id: "2", front: "S'il vous plaît", back: "Por favor" },
  { id: "3", front: "Merci", back: "Obrigado(a)" }
];

export default function FlashcardsPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'IDLE' | 'STUDY' | 'DONE'>('IDLE');
  const [stats, setStats] = useState({ ok: 0, bad: 0 });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/flashcards");
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setCards(data);
        } else {
          setCards(DEMO_CARDS);
        }
      } catch {
        setCards(DEMO_CARDS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleScore = (type: 'ok' | 'bad') => {
    setStats(s => ({ ...s, [type]: s[type] + 1 }));
    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        setMode('DONE');
      }
    }, 200);
  };

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen bg-[var(--color-s-50)] pt-24 pb-12 px-6">
      <div className="max-w-xl mx-auto">
        
        {mode === 'IDLE' && (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-[var(--color-s-200)] text-center">
            <div className="w-20 h-20 bg-blue-50 text-[var(--interface-accent)] rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <FiLayers size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[var( --color-s-800)]mb-2">Revisão Diária</h1>
            <p className="text-[var(--color-s-50)]0 mb-8">Tens {cards.length} flashcards para praticar hoje.</p>
            <button 
              onClick={() => setMode('STUDY')}
              className="w-full py-4 bg-[var(--interface-accent)] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:scale-[1.02] transition-transform"
            >
              Começar Agora
            </button>
          </div>
        )}

        {mode === 'STUDY' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <button onClick={() => setMode('IDLE')} className="text-[var(--color-s-400)] hover:text-[var(--color-s-600)]">
                <FiArrowLeft size={24} />
              </button>
              <div className="text-sm font-bold text-[var(--color-s-400)]">
                {currentIndex + 1} / {cards.length}
              </div>
              <div className="flex gap-3 text-xs font-bold">
                <span className="text-green-500">✓ {stats.ok}</span>
                <span className="text-red-400">✕ {stats.bad}</span>
              </div>
            </div>

            <div 
              className="relative h-80 w-full cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
              >
                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border-2 border-[var(--color-s-100)] flex flex-col items-center justify-center p-8">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Francês</span>
                  <h2 className="text-4xl font-bold text-[var(--color-s-800)]">{cards[currentIndex].front}</h2>
                  <p className="mt-8 text-[var(--color-s-300)] text-xs font-medium">Clica para ver a tradução</p>
                </div>

                <div 
                  className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border-2 border-pink-50 flex flex-col items-center justify-center p-8"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <span className="text-[10px] font-black text-[var(--clara-rose)] uppercase tracking-[0.2em] mb-4">Português</span>
                  <h2 className="text-3xl font-medium text-[var(--color-s-700)]">{cards[currentIndex].back}</h2>
                  <div className="absolute top-6 right-6 text-xl opacity-20 rotate-12">
                    <img src="/static/flower.svg" alt="Flor" className="w-8 h-8 object-contain pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            </div>

            <AnimatePresence>
              {isFlipped && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleScore('bad'); }}
                    className="py-4 bg-red-50 text-red-500 font-bold rounded-2xl border-2 border-red-100 hover:bg-red-100 transition-colors"
                  >
                    Ainda não sei
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleScore('ok'); }}
                    className="py-4 bg-green-50 text-green-600 font-bold rounded-2xl border-2 border-green-100 hover:bg-green-100 transition-colors"
                  >
                    Já sabia!
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {mode === 'DONE' && (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-[var(--color-s-200)] text-center animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center text-5xl mb-6">
              <img src="/static/flower.svg" alt="Flor" className="w-12 h-12 object-contain pointer-events-none" />
            </div>
            <h1 className="text-2xl font-bold text-[var( --color-s-800)]mb-2">Excelente Trabalho!</h1>
            <p className="text-[var(--color-s-50)]0 mb-8">Revisaste {cards.length} termos com sucesso.</p>
            
            <div className="flex bg-[var(--color-s-50)] p-1 rounded-2xl mb-8">
              <div className="flex-1 py-3 text-green-600 font-bold">✓ {stats.ok}</div>
              <div className="flex-1 py-3 text-red-400 font-bold">✕ {stats.bad}</div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-[var(--color-s-900)] text-white font-bold rounded-2xl hover:bg-[var(--color-s-800)]"
            >
              Finalizar Revisão
            </button>
          </div>
        )}

      </div>
    </main>
  );
}