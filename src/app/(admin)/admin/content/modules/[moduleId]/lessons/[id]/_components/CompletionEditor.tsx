"use client";

import { useState } from "react";
import { Plus, Trash2, Languages } from "lucide-react";

interface CompletionExercise {
  id: string;
  french: string;
  portuguese: string;
  type: "full" | "blank";
  blankPosition?: number;
}

interface CompletionEditorProps {
  content: {
    exercises: CompletionExercise[];
  };
  onChange: (content: any) => void;
}

export function CompletionEditor({ content, onChange }: CompletionEditorProps) {
  const [exercises, setExercises] = useState<CompletionExercise[]>(
    content?.exercises || [],
  );

  const updateExercises = (newExercises: CompletionExercise[]) => {
    setExercises(newExercises);
    onChange({ exercises: newExercises });
  };

  const addExercise = () => {
    if (exercises.length >= 10) {
      alert("Máximo de 10 exercícios permitidos");
      return;
    }

    const newExercise: CompletionExercise = {
      id: Date.now().toString(),
      french: "",
      portuguese: "",
      type: "full",
    };

    updateExercises([...exercises, newExercise]);
  };

  const updateExercise = (id: string, updates: Partial<CompletionExercise>) => {
    const newExercises = exercises.map((ex) =>
      ex.id === id ? { ...ex, ...updates } : ex,
    );
    updateExercises(newExercises);
  };

  const removeExercise = (id: string) => {
    if (exercises.length <= 5) {
      alert("Mínimo de 5 exercícios obrigatório");
      return;
    }

    updateExercises(exercises.filter((ex) => ex.id !== id));
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Languages className="text-interface-accent" size={32} />
        <div>
          <h2 className="text-2xl font-bold">Exercícios de Completar</h2>
          <p className="text-gray-600">
            Crie entre 5 e 10 exercícios de tradução/frase completa
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="border-2 border-gray-200 rounded-xl p-6 bg-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Exercício {index + 1}</h3>
              <div className="flex items-center gap-3">
                <select
                  value={exercise.type}
                  onChange={(e) =>
                    updateExercise(exercise.id, {
                      type: e.target.value as "full" | "blank",
                    })
                  }
                  className="px-3 py-1 border rounded-lg text-sm cursor-pointer"
                >
                  <option value="full">Tradução Completa</option>
                  <option value="blank">Completar Espaço</option>
                </select>
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Francês:
                </label>
                <input
                  type="text"
                  value={exercise.french}
                  onChange={(e) =>
                    updateExercise(exercise.id, { french: e.target.value })
                  }
                  placeholder="Digite a frase em francês..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-interface-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Português:
                </label>
                <input
                  type="text"
                  value={exercise.portuguese}
                  onChange={(e) =>
                    updateExercise(exercise.id, { portuguese: e.target.value })
                  }
                  placeholder="Digite a frase em português..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-interface-accent focus:border-transparent"
                />
              </div>

              {exercise.type === "blank" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posição do espaço vazio (palavra a ser completada):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.blankPosition || 1}
                    onChange={(e) =>
                      updateExercise(exercise.id, {
                        blankPosition: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-interface-accent focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número da palavra na frase que deve ser completada (ex: 1
                    para primeira palavra)
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Nota: O português servirá apenas como referência visual para
                    o aluno
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={addExercise}
          disabled={exercises.length >= 10}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-600 hover:border-interface-accent hover:text-interface-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus size={20} />
          Adicionar Exercício ({exercises.length}/10)
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Instruções:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>· Mínimo de 5 exercícios, máximo de 10</li>
          <li>· "Tradução Completa": usuário traduz a frase inteira</li>
          <li>
            · "Completar Espaço": português aparece como referência, francês com
            espaço vazio para completar
          </li>
          <li>· Não precisa usar maiúsculas, acentos ou pontuação</li>
          <li>· O sistema ignora diferenças de capitalização e acentuação</li>
        </ul>
      </div>
    </div>
  );
}
