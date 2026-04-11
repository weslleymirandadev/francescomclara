'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Volume2, X } from 'lucide-react';

interface Sentence {
  frase: string;
  traducao: string;
  explicacao: string;
}

interface SentenceBlockProps {
  sentence: Sentence;
  index: number;
}

// Contexto para gerenciar qual tooltip está ativo globalmente
const ActiveTooltipContext = createContext<{
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}>({
  activeIndex: null,
  setActiveIndex: () => {}
});

export function useActiveTooltip() {
  return useContext(ActiveTooltipContext);
}

// Provider para envolver o componente pai
export function ActiveTooltipProvider({ children }: { children: React.ReactNode }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <ActiveTooltipContext.Provider value={{ activeIndex, setActiveIndex }}>
      {children}
    </ActiveTooltipContext.Provider>
  );
}

export function SentenceBlock({ sentence, index }: SentenceBlockProps) {
  const { activeIndex, setActiveIndex } = useActiveTooltip();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMouseOverTooltip, setIsMouseOverTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Controla se este tooltip específico está visível
  const showTooltip = activeIndex === index;

  const speakFrench = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMouseEnter = () => {
    // Limpa qualquer timeout pendente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Se este tooltip não está ativo, ativa ele
    if (activeIndex !== index) {
      setActiveIndex(index);
    }
  };

  const handleMouseLeave = () => {
    // Se este tooltip está ativo e o mouse não está sobre o tooltip, espera meio segundo para fechar
    if (activeIndex === index && !isMouseOverTooltip) {
      timeoutRef.current = setTimeout(() => {
        setActiveIndex(null);
      }, 500);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede a propagação para não conflitar com o clique fora
    
    // Se este tooltip já está ativo, desativa. Senão, ativa.
    const newActiveIndex = activeIndex === index ? null : index;
    setActiveIndex(newActiveIndex);
    setIsMouseOverTooltip(false); // Reseta o estado do mouse sobre tooltip
    
    // Limpa qualquer timeout pendente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Fecha o tooltip quando clicar fora (apenas se estiver ativo)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeIndex === index) {
        // Verifica se o clique foi fora do tooltip
        const tooltipElement = document.getElementById(`tooltip-${index}`);
        if (tooltipElement && !tooltipElement.contains(event.target as Node)) {
          setActiveIndex(null);
        }
      }
    };

    if (activeIndex === index) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [activeIndex, index]);

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative group">
      <div 
        className="inline-block cursor-pointer p-2 rounded-lg transition-all duration-200 hover:bg-blue-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <span className="text-lg text-slate-700 font-medium">
          {sentence.frase}
        </span>
      </div>

      {showTooltip && (
        <div 
          id={`tooltip-${index}`}
          className="absolute z-50 left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
          onMouseEnter={() => setIsMouseOverTooltip(true)}
          onMouseLeave={() => setIsMouseOverTooltip(false)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakFrench(sentence.frase);
                }}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPlaying}
                title="Ouvir em francês"
              >
                <Volume2 size={16} className={isPlaying ? 'animate-pulse' : ''} />
              </button>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Frase {index + 1}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(null);
                setIsMouseOverTooltip(false); // Reseta o estado
              }}
              className="w-8 h-8 p-2 cursor-pointer hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Tradução
              </h4>
              <p className="text-slate-700 font-medium">
                {sentence.traducao}
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Explicação
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {sentence.explicacao}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
