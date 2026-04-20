"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Volume2, X } from "lucide-react";

interface Sentence {
  frase: string;
  traducao: string;
  explicacao: string;
}

interface SentenceBlockProps {
  sentence: Sentence;
  index: number;
}

export function SentenceBlock({ sentence, index }: SentenceBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speakFrench = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      const femaleFrenchVoice =
        voices.find(
          (v) =>
            v.lang.includes("fr") &&
            v.name.includes("Google") &&
            v.name.includes("Female"),
        ) ||
        voices.find(
          (v) =>
            v.lang.includes("fr") &&
            (v.name.includes("Female") || v.name.includes("Hortense")),
        ) ||
        voices.find((v) => v.lang.includes("fr"));

      if (femaleFrenchVoice) utterance.voice = femaleFrenchVoice;
      utterance.lang = "fr-FR";
      utterance.rate = 0.85;
      utterance.pitch = 1.1;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="inline-block cursor-pointer p-2 rounded-xl transition-all duration-200 hover:bg-blue-50 focus:bg-blue-50 outline-none group border-b-2 border-transparent hover:border-blue-100">
          <span className="text-lg text-slate-700 font-semibold tracking-tight">
            {sentence.frase}
          </span>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={12}
          align="start"
          className="z-100 w-80 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 outline-none"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakFrench(sentence.frase);
                }}
                disabled={isPlaying}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 shadow-lg shadow-blue-200 cursor-pointer"
                title="Ouvir em francês"
              >
                <Volume2
                  size={20}
                  className={isPlaying ? "animate-pulse" : ""}
                />
              </button>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Exemplo {index + 1}
                </p>
                <p className="text-xs font-bold text-blue-600">
                  Pronúncia Clara
                </p>
              </div>
            </div>

            <Popover.Close className="w-8 h-8 p-2 hover:bg-slate-50 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={18} />
            </Popover.Close>
          </div>

          <div className="space-y-5">
            <div className="relative p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
              <h4 className="absolute -top-3 left-0 px-2 bg-white text-[9px] font-black uppercase text-slate-400 tracking-widest border border-slate-200 rounded-full">
                Tradução
              </h4>
              <p className="text-slate-900 font-bold leading-tight italic pt-1">
                "{sentence.traducao}"
              </p>
            </div>

            <div className="px-1">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full" />
                Explicação
              </h4>
              <p className="text-slate-600 text-[13px] leading-relaxed font-medium">
                {sentence.explicacao}
              </p>
            </div>
          </div>

          <Popover.Arrow
            className="fill-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]"
            width={16}
            height={8}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
