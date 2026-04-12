"use client";

import { useState } from "react";
import { Plus, Trash2, Mic } from "lucide-react";

interface SpeakingExercise {
  id: string;
  french: string;
  portuguese: string;
  difficulty: "easy" | "medium" | "hard";
  hints: string[]; // dicas para o usuário
}

interface SpeakingEditorProps {
  content: {
    exercises: SpeakingExercise[];
  };
  onChange: (content: any) => void;
}

export function SpeakingEditor({ content, onChange }: SpeakingEditorProps) {
  const [exercises, setExercises] = useState<SpeakingExercise[]>(
    content?.exercises || []
  );

  const updateExercises = (newExercises: SpeakingExercise[]) => {
    setExercises(newExercises);
    onChange({ exercises: newExercises });
  };

  const addExercise = () => {
    if (exercises.length >= 10) {
      alert("Máximo de 10 exercícios permitidos");
      return;
    }

    const newExercise: SpeakingExercise = {
      id: Date.now().toString(),
      french: "",
      portuguese: "",
      difficulty: "medium",
      hints: [],
    };

    updateExercises([...exercises, newExercise]);
  };

  const updateExercise = (id: string, updates: Partial<SpeakingExercise>) => {
    const newExercises = exercises.map((ex) =>
      ex.id === id ? { ...ex, ...updates } : ex
    );
    updateExercises(newExercises);
  };

  const removeExercise = (id: string) => {
    if (exercises.length <= 3) {
      alert("Mínimo de 3 exercícios obrigatório");
      return;
    }

    updateExercises(exercises.filter((ex) => ex.id !== id));
  };

  const addHint = (exerciseId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    const newHints = [...exercise.hints, ""];
    updateExercise(exerciseId, { hints: newHints });
  };

  const updateHint = (exerciseId: string, hintIndex: number, value: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    const newHints = exercise.hints.map((hint, index) =>
      index === hintIndex ? value : hint
    );
    updateExercise(exerciseId, { hints: newHints });
  };

  const removeHint = (exerciseId: string, hintIndex: number) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    const newHints = exercise.hints.filter((_, index) => index !== hintIndex);
    updateExercise(exerciseId, { hints: newHints });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Mic className="text-interface-accent" size={32} />
        <div>
          <h2 className="text-2xl font-bold">Exercícios de Fala</h2>
          <p className="text-gray-600">
            Crie exercícios de reconhecimento de voz em francês
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
                  value={exercise.difficulty}
                  onChange={(e) =>
                    updateExercise(exercise.id, {
                      difficulty: e.target.value as "easy" | "medium" | "hard",
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${getDifficultyColor(
                    exercise.difficulty
                  )}`}
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Médio</option>
                  <option value="hard">Difícil</option>
                </select>
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frase em Francês (para o usuário falar):
                </label>
                <textarea
                  value={exercise.french}
                  onChange={(e) =>
                    updateExercise(exercise.id, { french: e.target.value })
                  }
                  placeholder="Digite a frase em francês que o usuário deve falar..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-interface-accent focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tradução em Português (para referência):
                </label>
                <textarea
                  value={exercise.portuguese}
                  onChange={(e) =>
                    updateExercise(exercise.id, { portuguese: e.target.value })
                  }
                  placeholder="Digite a tradução em português..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-interface-accent focus:border-transparent resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dicas para o usuário:
                  </label>
                  <button
                    onClick={() => addHint(exercise.id)}
                    className="text-sm text-interface-accent hover:text-interface-accent/80 font-medium"
                  >
                    + Adicionar dica
                  </button>
                </div>

                <div className="space-y-2">
                  {exercise.hints.map((hint, hintIndex) => (
                    <div key={hintIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) =>
                          updateHint(exercise.id, hintIndex, e.target.value)
                        }
                        placeholder="Digite uma dica..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-interface-accent focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => removeHint(exercise.id, hintIndex)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {exercise.hints.length === 0 && (
                    <p className="text-gray-500 text-sm italic">
                      Nenhuma dica adicionada. Dicas podem ajudar o usuário a
                      lembrar de palavras difíceis.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addExercise}
          disabled={exercises.length >= 10}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-600 hover:border-interface-accent hover:text-interface-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Adicionar Exercício ({exercises.length}/10)
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Instruções:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>· Mínimo de 3 exercícios, máximo de 10</li>
          <li>· O usuário usará o microfone para falar a frase em francês</li>
          <li>· O sistema destacará em azul as palavras corretamente reconhecidas</li>
          <li>· A lição é completa quando mais da metade da frase é dita corretamente</li>
          <li>· Dicas opcionais podem ajudar com palavras difíceis</li>
          <li>· Use a Web Speech API para reconhecimento de voz</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2">Dicas de criação:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>· Comece com frases simples e aumente a dificuldade gradualmente</li>
          <li>· Use vocabulário que o aluno já tenha aprendido</li>
          <li>· Evite frases muito longas (máximo 15 palavras)</li>
          <li>· Inclua expressões comuns do dia a dia</li>
        </ul>
      </div>
    </div>
  );
}
