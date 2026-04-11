"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChevronRight, ChevronLeft, Check, Languages, X, RotateCcw } from "lucide-react";

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

export function CompletionLesson({ content, onComplete, lessonId }: CompletionLessonProps) {
  const { data: session } = useSession();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set()
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<Map<number, SavedAnswer>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const exercises = content?.exercises || [];
  const exercise = exercises[currentExercise];

  useEffect(() => {
    // Carregar resposta salva se existir
    const savedAnswer = savedAnswers.get(currentExercise);
    console.log("Loading answer for exercise", currentExercise, savedAnswer);
    if (savedAnswer) {
      setUserAnswer(savedAnswer.userAnswer);
      setFeedback(savedAnswer.isCorrect ? "correct" : "incorrect");
      setShowAnswer(true); // Mostrar a resposta se já foi respondida
    } else {
      setUserAnswer("");
      setFeedback(null);
      setShowAnswer(false);
    }
  }, [currentExercise]);

  // Carregar respostas salvas quando o componente montar ou quando lessonId mudar
  useEffect(() => {
    if (session?.user?.id && lessonId) {
      loadSavedAnswers();
    }
  }, [session?.user?.id, lessonId]);

  const loadSavedAnswers = async () => {
    try {
      console.log("Loading saved answers for lesson:", lessonId);
      const response = await fetch(`/api/exercises/answers?lessonId=${lessonId}&exerciseType=COMPLETION`);
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded answers:", data);
        const answersMap = new Map<number, SavedAnswer>();
        data.answers.forEach((answer: SavedAnswer) => {
          answersMap.set(answer.exerciseIndex, answer);
          if (answer.isCorrect) {
            setCompletedExercises(prev => new Set(prev).add(answer.exerciseIndex));
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

  const saveAnswer = async (userAnswer: string, correctAnswer: string, isCorrect: boolean) => {
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

        setSavedAnswers(prev => {
          const newMap = new Map(prev);
          newMap.set(currentExercise, newAnswer);
          console.log("Answer saved for exercise", currentExercise, newAnswer);
          return newMap;
        });

        if (isCorrect) {
          setCompletedExercises(prev => new Set(prev).add(currentExercise));
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
    // Limpar todos os estados
    setCurrentExercise(0);
    setUserAnswer("");
    setFeedback(null);
    setShowAnswer(false);
    setCompletedExercises(new Set());
    setSavedAnswers(new Map());
    
    // Limpar respostas do banco de dados
    if (session?.user?.id && lessonId) {
      fetch(`/api/exercises/answers?lessonId=${lessonId}&exerciseType=COMPLETION`, {
        method: "DELETE"
      }).catch(error => console.error("Error clearing answers:", error));
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
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^\w\s]/g, "") // Remove pontuação
      .trim();
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const normalizedUserAnswer = normalizeText(userAnswer);
    let correctAnswer = "";

    if (exercise.type === "full") {
      correctAnswer = normalizeText(exercise.french);
    } else {
      // Para tipo "blank", precisamos extrair a palavra específica
      const words = exercise.french.split(/\s+/);
      const position = exercise.blankPosition || 1;
      correctAnswer = normalizeText(words[position - 1] || "");
    }

    const isCorrect = normalizedUserAnswer === correctAnswer;

    setFeedback(isCorrect ? "correct" : "incorrect");

    // Salvar resposta no banco de dados
    saveAnswer(userAnswer, correctAnswer, isCorrect);

    setShowAnswer(true);

    if (isCorrect) {
      setCompletedExercises((prev) => new Set([...prev, currentExercise]));

      // Verifica se todos os exercícios foram completados corretamente
      const allCompleted = new Set([...completedExercises, currentExercise]).size === exercises.length;

      // Avança para o próximo exercício após 1.5s
      setTimeout(() => {
        if (currentExercise < exercises.length - 1) {
          setCurrentExercise(currentExercise + 1);
        } else if (allCompleted) {
          // Todos os exercícios concluídos corretamente - marca progresso
          markLessonAsCompleted();
          onComplete?.();
        }
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !feedback) {
      checkAnswer();
    }
  };

  const progress = (completedExercises.size / exercises.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
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
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Refazer Lição
        </button>
      </div>

      {/* Progress Bar */}
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

      {/* Exercise Card */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-6">
        {exercise.type === "full" ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Traduza para francês:</h3>
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
              <h3 className="text-lg font-semibold mb-2">Referência em português:</h3>
              <p className="text-xl text-gray-600 bg-gray-50 p-4 rounded-lg">
                {exercise.portuguese}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Complete a frase em francês:</h3>
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
                            <span className="text-gray-400 select-none">ㅤㅤㅤㅤ</span>
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

        {/* Feedback */}
        {feedback && (
          <div
            className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${feedback === "correct"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
              }`}
          >
            {feedback === "correct" ? (
              <Check size={20} className="text-green-600" />
            ) : (
              <X size={20} className="text-red-600" />
            )}
            <div>
              <p className="font-semibold">
                {feedback === "correct" ? "Correto!" : "Incorreto!"}
              </p>
              {feedback === "incorrect" && (
                <p className="text-sm mt-1">
                  Resposta correta: <strong>{exercise.french}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          {!feedback && (
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              className="px-6 py-3 bg-interface-accent text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-interface-accent/90 transition-colors"
            >
              Verificar Resposta
            </button>
          )}

          {feedback === "incorrect" && (
            <button
              onClick={() => {
                setUserAnswer("");
                setFeedback(null);
              }}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Tentar Novamente
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-5">
          <button 
            className={`flex gap-2 justify-between items-center p-2 rounded-md transition-colors ${
              currentExercise === 0 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-interface-accent text-white hover:bg-interface-accent/90"
            }`}
            onClick={() => setCurrentExercise(currentExercise - 1)}
            disabled={currentExercise === 0}
          >
            <ChevronLeft size={20} />
            <span>Anterior</span>
          </button>

          <span>{currentExercise + 1} / {exercises.length}</span>

          <button 
            className={`flex gap-2 justify-between items-center p-2 rounded-md transition-colors ${
              !feedback || feedback === "incorrect"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-interface-accent text-white hover:bg-interface-accent/90"
            }`}
            onClick={() => currentExercise < exercises.length - 1
              ? setCurrentExercise(currentExercise + 1)
              : onComplete?.()}
            disabled={!feedback || feedback === "incorrect"}
          >
            {currentExercise === exercises.length - 1 ? "Concluir" : "Próximo"}
            {currentExercise === exercises.length - 1 ? <Check  size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
