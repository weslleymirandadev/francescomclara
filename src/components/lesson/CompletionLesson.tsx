"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Languages,
  X,
  RotateCcw,
} from "lucide-react";

interface CompletionExercise {
  id: string;
  french: string;
  portuguese: string;
  type: "full" | "blank";
  blankPosition?: number;
}

interface SavedAnswer {
  exerciseIndex: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface CompletionLessonProps {
  content: {
    exercises: CompletionExercise[];
  };
  onChange?: (content: any) => void;
  onComplete?: () => void;
  lessonId?: string;
}

export function CompletionLesson({
  content,
  onComplete,
  lessonId,
}: CompletionLessonProps) {
  const { data: session } = useSession();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set(),
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<Map<number, SavedAnswer>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);

  const exercises = content?.exercises || [];
  const exercise = exercises[currentExercise];
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const savedAnswer = savedAnswers.get(currentExercise);
    console.log("Loading answer for exercise", currentExercise, savedAnswer);
    if (savedAnswer) {
      setUserAnswer(savedAnswer.userAnswer);
      setFeedback(savedAnswer.isCorrect ? "correct" : "incorrect");
      setShowAnswer(true);
    } else {
      setUserAnswer("");
      setFeedback(null);
      setShowAnswer(false);
    }
  }, [currentExercise]);

  useEffect(() => {
    if (session?.user?.id && lessonId) {
      loadSavedAnswers();
    }
  }, [session?.user?.id, lessonId]);

  const loadSavedAnswers = async () => {
    try {
      console.log("Loading saved answers for lesson:", lessonId);
      const response = await fetch(
        `/api/exercises/answers?lessonId=${lessonId}&exerciseType=COMPLETION`,
      );
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Loaded answers:", data);
        const answersMap = new Map<number, SavedAnswer>();
        data.answers.forEach((answer: SavedAnswer) => {
          answersMap.set(answer.exerciseIndex, answer);
          if (answer.isCorrect) {
            setCompletedExercises((prev) =>
              new Set(prev).add(answer.exerciseIndex),
            );
          }
        });
        setSavedAnswers(answersMap);
        console.log("Answers map set:", answersMap);
      } else {
        console.error("Failed to load answers:", response.statusText);
      }
    } catch (error) {
      console.error("Error loading saved answers:", error);
    }
  };

  const saveAnswer = async (
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
  ) => {
    if (!session?.user?.id || !lessonId) {
      console.log("Cannot save answer - missing session or lessonId");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        lessonId,
        exerciseIndex: currentExercise,
        userAnswer,
        correctAnswer,
        isCorrect,
        exerciseType: "COMPLETION",
      };
      console.log("Saving answer:", payload);

      const response = await fetch("/api/exercises/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Save response status:", response.status);

      if (response.ok) {
        const newAnswer: SavedAnswer = {
          exerciseIndex: currentExercise,
          userAnswer,
          correctAnswer,
          isCorrect,
        };

        setSavedAnswers((prev) => {
          const newMap = new Map(prev);
          newMap.set(currentExercise, newAnswer);
          console.log("Answer saved for exercise", currentExercise, newAnswer);
          return newMap;
        });

        if (isCorrect) {
          setCompletedExercises((prev) => new Set(prev).add(currentExercise));
        }
      } else {
        console.error("Failed to save answer:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markLessonAsCompleted = async () => {
    if (!lessonId) return;

    try {
      await fetch("/api/course/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId, completed: true }),
      });
      console.log("Lesson marked as completed:", lessonId);
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
    }
  };

  const resetLesson = () => {
    setCurrentExercise(0);
    setUserAnswer("");
    setFeedback(null);
    setShowAnswer(false);
    setCompletedExercises(new Set());
    setSavedAnswers(new Map());

    if (session?.user?.id && lessonId) {
      fetch(
        `/api/exercises/answers?lessonId=${lessonId}&exerciseType=COMPLETION`,
        {
          method: "DELETE",
        },
      ).catch((error) => console.error("Error clearing answers:", error));
    }
  };

  if (!exercise || exercises.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Nenhum exercício disponível.</p>
      </div>
    );
  }

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .trim();
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const normalizedUserAnswer = normalizeText(userAnswer);
    let correctAnswer = "";

    if (exercise.type === "full") {
      correctAnswer = normalizeText(exercise.french);
    } else {
      const words = exercise.french.split(/\s+/);
      const position = exercise.blankPosition || 1;
      correctAnswer = normalizeText(words[position - 1] || "");
    }

    const isCorrect = normalizedUserAnswer === correctAnswer;

    setFeedback(isCorrect ? "correct" : "incorrect");
    saveAnswer(userAnswer, correctAnswer, isCorrect);
    setShowAnswer(true);

    if (isCorrect) {
      setCompletedExercises((prev) => new Set([...prev, currentExercise]));

      const allCompleted =
        new Set([...completedExercises, currentExercise]).size ===
        exercises.length;

      setFeedback("correct");
      setAttempts(0);

      setTimeout(() => {
        if (currentExercise < exercises.length - 1) {
          setCurrentExercise(currentExercise + 1);
        } else if (allCompleted) {
          markLessonAsCompleted();
          onComplete?.();
        }
      }, 1500);
    } else {
      setFeedback("incorrect");
      setAttempts((prev) => prev + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !feedback) {
      checkAnswer();
    }
  };

  const generateHint = (text: string, attempt: number) => {
    return text
      .split(" ")
      .map((word) => {
        if (word.length <= 2) return word;

        if (attempt === 1) {
          return word[0] + "_".repeat(word.length - 1);
        }
        if (attempt === 2) {
          return word[0] + "_".repeat(word.length - 2) + word[word.length - 1];
        }
        return word;
      })
      .join(" ");
  };

  const progress = (completedExercises.size / exercises.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Languages className="text-interface-accent" size={32} />
          <div>
            <h2 className="text-2xl font-bold">Exercício de Completar</h2>
            <p className="text-gray-600">
              Exercício {currentExercise + 1} de {exercises.length}
            </p>
          </div>
        </div>

        <button
          onClick={resetLesson}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw size={16} />
          Refazer Lição
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-interface-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-6">
        {exercise.type === "full" ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Traduza para francês:
              </h3>
              <p className="text-xl text-gray-800">{exercise.portuguese}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sua resposta em francês:
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite a tradução..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-interface-accent focus:border-transparent text-lg"
                disabled={feedback !== null}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Referência em português:
              </h3>
              <p className="text-xl text-gray-600 bg-gray-50 p-4 rounded-lg">
                {exercise.portuguese}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Complete a frase em francês:
              </h3>
              <div className="text-xl">
                {exercise.french.split(/\s+/).map((word, index) => {
                  const position = exercise.blankPosition || 1;
                  const isBlank = index === position - 1;

                  return (
                    <span key={index} className="inline-block mr-2">
                      {isBlank ? (
                        <span className="inline-block w-24 border-b-2 border-interface-accent text-center">
                          {feedback === "correct" && userAnswer ? (
                            <span className="text-green-600 font-semibold">
                              {userAnswer}
                            </span>
                          ) : (
                            <span className="text-gray-400 select-none">
                              ㅤㅤㅤㅤ
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="font-medium">{word}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palavra que falta:
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite a palavra que falta..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-interface-accent focus:border-transparent text-lg"
                disabled={feedback !== null}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-6">
          {/* O Feedback aparece como um "balão" acima dos botões */}
          {feedback === "incorrect" && (
            <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-orange-800 mb-2">
                <RotateCcw size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Dica ({attempts}ª tentativa):
                </span>
              </div>

              <p className="text-lg font-mono tracking-[0.2em] text-orange-900 bg-white/50 p-2 rounded">
                {generateHint(exercise.french, attempts)}
              </p>

              {attempts >= 3 && (
                <p className="mt-3 text-xs text-red-600 font-medium italic border-t border-orange-200 pt-2">
                  Resposta completa: {exercise.french}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            {/* Botão Principal: Ele muda de cor e texto conforme o estado */}
            <button
              onClick={
                feedback === "incorrect" ? () => setFeedback(null) : checkAnswer
              }
              disabled={!userAnswer.trim() && feedback !== "incorrect"}
              className={`flex-1 px-6 py-4 rounded-2xl font-black uppercase text-sm transition-all shadow-lg active:scale-95 ${
                feedback === "incorrect"
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200"
                  : "bg-interface-accent hover:bg-interface-accent/90 text-white shadow-blue-200"
              }`}
            >
              {feedback === "incorrect"
                ? "Tentar Corrigir"
                : "Verificar Resposta"}
            </button>

            {/* Botão de Pular ou Desistir (Opcional, só aparece se errar muito) */}
            {feedback === "incorrect" && attempts >= 2 && (
              <button
                onClick={() => {
                  setUserAnswer(exercise.french); // Preenche a resposta pra ele
                  setFeedback(null);
                }}
                className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-sm hover:bg-gray-200 transition-all"
              >
                Revelar
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-5">
          <button
            className={`flex gap-2 justify-between items-center p-2 rounded-md transition-colors ${
              currentExercise === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-interface-accent text-white hover:bg-interface-accent/90 cursor-pointer"
            }`}
            onClick={() => setCurrentExercise(currentExercise - 1)}
            disabled={currentExercise === 0}
          >
            <ChevronLeft size={20} />
            <span>Anterior</span>
          </button>

          <span>
            {currentExercise + 1} / {exercises.length}
          </span>

          <button
            className={`flex gap-2 justify-between items-center p-2 rounded-md transition-colors ${
              !feedback || feedback === "incorrect"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-interface-accent text-white hover:bg-interface-accent/90 cursor-pointer"
            }`}
            onClick={() =>
              currentExercise < exercises.length - 1
                ? setCurrentExercise(currentExercise + 1)
                : onComplete?.()
            }
            disabled={!feedback || feedback === "incorrect"}
          >
            {currentExercise === exercises.length - 1 ? "Concluir" : "Próximo"}
            {currentExercise === exercises.length - 1 ? (
              <Check size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
