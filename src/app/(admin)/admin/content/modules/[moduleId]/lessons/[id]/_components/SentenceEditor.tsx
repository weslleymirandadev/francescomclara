"use client";

import { useState } from "react";
import { Plus, Trash2, Volume2 } from "lucide-react";

interface Sentence {
  frase: string;
  traducao: string;
  explicacao: string;
}

interface SentenceEditorProps {
  content: any;
  onChange: (newContent: any) => void;
}

export function SentenceEditor({ content, onChange }: SentenceEditorProps) {
  const data = content || { sentences: [] };
  const sentences = data.sentences || [];

  const speakFrench = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const addSentence = () => {
    const newSentence: Sentence = {
      frase: "",
      traducao: "",
      explicacao: ""
    };
    onChange({
      ...data,
      sentences: [...sentences, newSentence]
    });
  };

  const updateSentence = (index: number, field: keyof Sentence, value: string) => {
    const updatedSentences = [...sentences];
    updatedSentences[index] = {
      ...updatedSentences[index],
      [field]: value
    };
    onChange({
      ...data,
      sentences: updatedSentences
    });
  };

  const removeSentence = (index: number) => {
    const updatedSentences = sentences.filter((_: any, i: number) => i !== index);
    onChange({
      ...data,
      sentences: updatedSentences
    });
  };

  const moveSentence = (index: number, direction: 'up' | 'down') => {
    const updatedSentences = [...sentences];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < sentences.length) {
      [updatedSentences[index], updatedSentences[newIndex]] = 
      [updatedSentences[newIndex], updatedSentences[index]];
      
      onChange({
        ...data,
        sentences: updatedSentences
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
            <span className="text-lg font-bold">Fr</span>
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
            Frases Interativas
          </h3>
        </div>
        <button
          onClick={addSentence}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Adicionar Frase</span>
        </button>
      </div>

      {sentences.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-500 mb-4">Nenhuma frase adicionada ainda</p>
          <button
            onClick={addSentence}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Adicionar Primeira Frase</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sentences.map((sentence: Sentence, index: number) => (
            <div key={index} className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h4 className="font-medium text-slate-800">Frase {index + 1}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveSentence(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    <span className="text-slate-400">↑</span>
                  </button>
                  <button
                    onClick={() => moveSentence(index, 'down')}
                    disabled={index === sentences.length - 1}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    <span className="text-slate-400">↓</span>
                  </button>
                  <button
                    onClick={() => removeSentence(index)}
                    className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors duration-200"
                    title="Remover frase"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Frase em Francês
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sentence.frase}
                      onChange={(e) => updateSentence(index, 'frase', e.target.value)}
                      placeholder="Ex: Bonjour à tous!"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => speakFrench(sentence.frase)}
                      disabled={!sentence.frase}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Ouvir em francês"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Tradução em Português
                  </label>
                  <input
                    type="text"
                    value={sentence.traducao}
                    onChange={(e) => updateSentence(index, 'traducao', e.target.value)}
                    placeholder="Ex: Bom dia a todos!"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Explicação Gramatical/Cultural
                  </label>
                  <textarea
                    value={sentence.explicacao}
                    onChange={(e) => updateSentence(index, 'explicacao', e.target.value)}
                    placeholder="Ex: O 'à' aqui indica direção/destino. 'Tous' é usado para o plural geral."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
