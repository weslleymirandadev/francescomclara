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

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'IDLE' | 'STUDY' | 'DONE'>('IDLE');
  const [stats, setStats] = useState({ ok: 0, bad: 0 });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/flashcards?limit=10&status=review"); 
        if (res.ok) {
          const data = await res.json();
          setCards(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'STUDY') return;

      if (e.key === ' ' || e.key === 'Enter') {
        setIsFlipped(prev => !prev);
      }
      if (isFlipped) {
        if (e.key === 'ArrowLeft') handleNext(false);
        if (e.key === 'ArrowRight') handleNext(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isFlipped, currentIndex]);

  if (loading) return <Loading />;

  if (!cards || cards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto pt-20 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLayers size={32} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">
            Sem cards por agora!
          </h2>
          <p className="text-slate-500 font-medium">
            Volte mais tarde ou complete novas lições para gerar mais flashcards.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = async (wasOk: boolean) => {
    if (!currentCard) return;

    setStats(prev => ({
      ok: wasOk ? prev.ok + 1 : prev.ok,
      bad: wasOk ? prev.bad : prev.bad + 1
    }));

    fetch(`/api/flashcards/${currentCard.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wasOk })
    });

    if (!wasOk) {
      setCards(prev => [...prev, currentCard]);
    }

    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 150);
    } else {
      setMode('DONE');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-10 pb-20">
      <div className="flex items-center justify-between mb-8 px-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
        >
          <FiArrowLeft size={16} /> Voltar
        </button>
        
        <div className="flex items-center gap-4">
          <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-(--interface-accent) transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      {mode === 'IDLE' && (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-center">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">
            Pronto para revisar?
          </h1>
          <p className="text-slate-500 mb-8 font-medium">
            Você tem {cards.length} cards pendentes na sua trilha atual.
          </p>
          <button 
            onClick={() => setMode('STUDY')}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Começar Revisão
          </button>
        </div>
      )}

      {mode === 'STUDY' && currentCard && (
        <div className="perspective-1000 w-full max-w-2xl mx-auto px-4">
          <motion.div
            key={currentCard.id + currentIndex}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full aspect-16/10 cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div 
              className={`absolute inset-0 bg-white rounded-[40px] shadow-xl border-2 border-slate-50 flex flex-col items-center justify-center p-12 text-center transition-opacity duration-300 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
              style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden',
                zIndex: isFlipped ? 0 : 1 
              }}
            >
              <span className="text-[10px] font-black text-(--interface-accent) uppercase tracking-[0.2em] mb-4">Francês</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter lowercase">
                {currentCard.front}
              </h2>
              <p className="absolute bottom-10 text-[9px] font-black text-slate-300 uppercase tracking-widest">Clique para ver a tradução</p>
            </div>

            <div 
              className={`absolute inset-0 bg-slate-900 rounded-[40px] shadow-xl flex flex-col items-center justify-center p-12 text-center transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
              style={{ 
                transform: 'rotateY(180deg)', 
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                zIndex: isFlipped ? 1 : 0
              }}
            >
              <div className="w-full flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Português</span>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                  {currentCard.back}
                </h2>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {isFlipped && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="grid grid-cols-2 gap-4 mt-8"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(false); }}
                  className="py-4 bg-red-50 text-red-500 font-black uppercase tracking-widest text-[11px] rounded-2xl border-2 border-red-100 hover:bg-red-100 transition-colors"
                >
                  Ainda não sei
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(true); }}
                  className="py-4 bg-emerald-50 text-emerald-600 font-black uppercase tracking-widest text-[11px] rounded-2xl border-2 border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                  Já sabia!
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {mode === 'DONE' && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-6">🎯</div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Incrível!</h1>
          <p className="text-slate-500 mb-8 font-medium">Você revisou {cards.length} termos hoje.</p>
          
          <div className="flex gap-4 max-w-xs mx-auto mb-8">
            <div className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <div className="text-emerald-600 font-black text-xl">{stats.ok}</div>
              <div className="text-[9px] font-black text-emerald-600/60 uppercase">Acertos</div>
            </div>
            <div className="flex-1 bg-red-50 p-4 rounded-2xl border border-red-100">
              <div className="text-red-500 font-black text-xl">{stats.bad}</div>
              <div className="text-[9px] font-black text-red-500/60 uppercase">Erros</div>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
          >
            Voltar ao Dashboard
          </button>
        </div>
      )}
    </div>
  );
}