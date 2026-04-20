"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { start } from "node:repl";

interface SpeakingExercise {
  id: string;
  french: string;
  portuguese: string;
  difficulty: "easy" | "medium" | "hard";
  hints: string[];
}

interface SavedAnswer {
  exerciseIndex: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface SpeakingLessonProps {
  content: {
    exercises: SpeakingExercise[];
  };
  onChange?: (content: any) => void;
  onComplete?: () => void;
  lessonId?: string;
}

export function SpeakingLesson({
  content,
  onComplete,
  lessonId,
}: SpeakingLessonProps) {
  const { data: session } = useSession();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<
    "correct" | "incorrect" | "partial" | null
  >(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set(),
  );
  const [recognition, setRecognition] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<Map<number, SavedAnswer>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correctWords, setCorrectWords] = useState<Set<number>>(new Set());
  const [exercise, setExercise] = useState<SpeakingExercise>(
    content.exercises[0],
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isAudioPlayingRef = useRef(false);
  const exerciseRef = useRef(exercise);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[àáâäãåā]/g, "a")
      .replace(/[éêëē]/g, "e")
      .replace(/[ìíîïī]/g, "i")
      .replace(/[òóôõöō]/g, "o")
      .replace(/[ùúûüū]/g, "u")
      .replace(/[ýÿ]/g, "y")
      .replace(/[ç]/g, "c")
      .replace(/[^a-z\s]/g, "")
      .trim();
  };

  const calculateSimilarity = (text1: string, text2: string): number => {
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const checkAnswer = (spokenText: string) => {
    if (isAudioPlayingRef.current) {
      console.log("Bloqueado: O robô está falando, ignorando mic.");
      return;
    }

    const currentExerciseData = exerciseRef.current;

    if (!currentExerciseData || !currentExerciseData.french) {
      console.error("ERROR: No exercise!");
      return;
    }

    const normalizedSpoken = normalizeText(spokenText);
    const normalizedExpected = normalizeText(currentExerciseData.french);

    const similarity = calculateSimilarity(
      normalizedSpoken,
      normalizedExpected,
    );
    console.log("SIMILARITY:", Math.round(similarity * 100) + "%");

    if (similarity < 0.3) {
      console.log("REJECTED - Too different!");
      setFeedback("incorrect");
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
      return;
    }

    const expectedWords = normalizedExpected.split(/\s+/);
    const spokenWords = normalizedSpoken.split(/\s+/);

    const correctWordIndices = new Set<number>();
    let correctCount = 0;

    for (let i = 0; i < expectedWords.length; i++) {
      if (spokenWords[i] && spokenWords[i] === expectedWords[i]) {
        correctWordIndices.add(i);
        correctCount++;
      }
    }

    const accuracy = correctCount / expectedWords.length;
    const isCorrect = accuracy >= 0.5;

    setCorrectWords(correctWordIndices);
    saveAnswer(spokenText, currentExerciseData.french, isCorrect);

    if (isCorrect) {
      setFeedback("correct");
      setCompletedExercises((prev) => new Set([...prev, currentExercise]));

      const allCompleted =
        new Set([...completedExercises, currentExercise]).size ===
        content.exercises.length;

      setTimeout(() => {
        if (currentExercise < content.exercises.length - 1) {
          setCurrentExercise(currentExercise + 1);
        } else if (allCompleted) {
          markLessonAsCompleted();
          onComplete?.();
        }
      }, 2000);
    } else if (accuracy > 0) {
      setFeedback("partial");
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    } else {
      setFeedback("incorrect");
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    }
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("WebKitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = "fr-FR";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);

        checkAnswer(text);
      };

      rec.onend = () => setIsListening(false);
      setRecognition(rec);

      return () => {
        if (rec) rec.stop();
        window.speechSynthesis.cancel();
      };
    }
  }, [currentExercise]);

  useEffect(() => {
    setTranscript("");
    setFeedback(null);
    setCorrectWords(new Set());
    setError(null);
  }, [currentExercise]);

  useEffect(() => {
    setExercise(content.exercises[currentExercise]);
    const savedAnswer = savedAnswers.get(currentExercise);
    if (savedAnswer) {
      setTranscript(savedAnswer.userAnswer);
      setFeedback(savedAnswer.isCorrect ? "correct" : "incorrect");
      setShowHints(true);

      if (savedAnswer.isCorrect) {
        const normalizedSpoken = normalizeText(savedAnswer.userAnswer);
        const normalizedExpected = normalizeText(exercise!.french);
        const expectedWords = normalizedExpected.split(/\s+/);
        const spokenWords = normalizedSpoken.split(/\s+/);

        const correctWordIndices = new Set<number>();
        for (let i = 0; i < expectedWords.length; i++) {
          if (spokenWords[i] && spokenWords[i] === expectedWords[i]) {
            correctWordIndices.add(i);
          }
        }
        setCorrectWords(correctWordIndices);
      } else {
        setCorrectWords(new Set());
      }
    } else {
      console.log("No saved answer, resetting states");
      setTranscript("");
      setFeedback(null);
      setShowHints(false);
      setCorrectWords(new Set());
    }
  }, [currentExercise, exercise?.french]);

  useEffect(() => {
    if (session?.user?.id && lessonId) {
      loadSavedAnswers();
    }
  }, [session?.user?.id, lessonId]);

  useEffect(() => {
    const recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (recognition) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      console.warn(
        "Este navegador não suporta a Web Speech API. No Firefox, tente usar o Chrome ou Edge.",
      );
    }
  }, []);

  const loadSavedAnswers = async () => {
    try {
      const response = await fetch(
        `/api/exercises/answers?lessonId=${lessonId}&exerciseType=SPEAKING`,
      );
      if (response.ok) {
        const data = await response.json();
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
    if (!session?.user?.id || !lessonId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/exercises/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          exerciseIndex: currentExercise,
          userAnswer,
          correctAnswer,
          isCorrect,
          exerciseType: "SPEAKING",
        }),
      });

      if (response.ok) {
        const newAnswer: SavedAnswer = {
          exerciseIndex: currentExercise,
          userAnswer,
          correctAnswer,
          isCorrect,
        };

        setSavedAnswers((prev) =>
          new Map(prev).set(currentExercise, newAnswer),
        );

        if (isCorrect) {
          setCompletedExercises((prev) => new Set(prev).add(currentExercise));
        }
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

  if (!exercise || content.exercises.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Nenhum exercício disponível.</p>
      </div>
    );
  }

  const startListening = () => {
    if (isAudioPlayingRef.current) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setTranscript("");
    setFeedback(null);
    setCorrectWords(new Set());

    const currentEx = content.exercises[currentExercise];
    setExercise(currentEx);

    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error("ERROR:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const skipExercise = () => {
    if (currentExercise < content.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      onComplete?.();
    }
  };

  const resetLesson = () => {
    setCurrentExercise(0);
    setTranscript("");
    setFeedback(null);
    setError(null);
    setShowHints(false);
    setCorrectWords(new Set());
    setCompletedExercises(new Set());
    setSavedAnswers(new Map());

    if (session?.user?.id && lessonId) {
      fetch(
        `/api/exercises/answers?lessonId=${lessonId}&exerciseType=SPEAKING`,
        {
          method: "DELETE",
        },
      ).catch((error) => console.error("Error clearing answers:", error));
    }
  };

  const progress = (completedExercises.size / content.exercises.length) * 100;
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

  const renderHighlightedText = () => {
    if (!transcript) return null;

    const expectedWords = exercise.french.split(/\s+/);

    return (
      <div className="text-lg font-medium">
        {expectedWords.map((word, index) => {
          const isCorrect = correctWords.has(index);

          return (
            <span key={index} className="inline-block mr-2">
              <span
                className={
                  isCorrect ? "text-green-600 font-semibold" : "text-gray-400"
                }
              >
                {word}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  const playAudio = (text: string) => {
    if (isListening) {
      stopListening();
    }

    isAudioPlayingRef.current = true;
    setIsSpeaking(true);
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

    utterance.onstart = () => {
      isAudioPlayingRef.current = true;
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setTimeout(() => {
        isAudioPlayingRef.current = false;
        setIsSpeaking(false);
      }, 300);
    };

    utterance.onerror = () => {
      isAudioPlayingRef.current = false;
      setIsSpeaking(false);
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 250);
  };

  useEffect(() => {
    exerciseRef.current = content.exercises[currentExercise];
  }, [currentExercise, content.exercises]);

  if (!isSupported) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600" size={24} />
            <h3 className="text-lg font-semibold text-red-900">
              Reconhecimento de voz não suportado
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            {error || "Seu navegador não suporta reconhecimento de voz."}
          </p>
          <p className="text-sm text-red-600">
            Recomendamos usar o navegador Chrome ou Edge para esta
            funcionalidade.
          </p>
          <button
            onClick={() => {
              onComplete?.();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Pular Exercício
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Mic className="text-interface-accent" size={32} />
          <div>
            <h2 className="text-2xl font-bold">Exercício de Fala</h2>
            <p className="text-gray-600">
              Exercício {currentExercise + 1} de {content.exercises.length}
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
        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exercise.difficulty)}`}
          >
            {exercise.difficulty === "easy"
              ? "Fácil"
              : exercise.difficulty === "medium"
                ? "Médio"
                : "Difícil"}
          </span>
        </div>

        <div className="flex justify-between items-start mb-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
              Fale esta frase em francês:
            </h3>
            <div className="text-2xl font-bold text-slate-800 mb-2 italic">
              "{exercise.french}"
            </div>
            <p className="text-lg text-slate-500 font-medium">
              {exercise.portuguese}
            </p>
          </div>

          <button
            disabled={isListening || isSpeaking}
            onClick={() => playAudio(exercise.french)}
            className={`p-3 rounded-md bg-interface-accent transition-all active:scale-95 text-white shadow-sm cursor-pointer ${
              isListening || isSpeaking
                ? "opacity-50 cursor-not-allowed"
                : "hover:opacity-80"
            }`}
          >
            <Volume2 size={24} />
          </button>
        </div>

        {exercise.hints.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowHints(!showHints)}
              className="text-sm text-interface-accent hover:text-interface-accent/80 font-medium cursor-pointer"
            >
              {showHints ? "Ocultar" : "Mostrar"} Dicas ({exercise.hints.length}
              )
            </button>

            {showHints && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <ul className="text-sm text-yellow-800 space-y-1">
                  {exercise.hints.map((hint, index) => (
                    <li key={index}>· {hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-10">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute w-24 h-24 bg-red-400/40 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />

                <div className="absolute w-24 h-24 bg-red-400/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_700ms]" />

                <div className="absolute w-24 h-24 bg-red-400/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_1400ms]" />
              </>
            )}

            <button
              disabled={isSpeaking}
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                isSpeaking ? "opacity-50 cursor-not-allowed" : ""
              } ${
                isListening
                  ? "bg-red-500 scale-110 shadow-red-200"
                  : "bg-interface-accent hover:scale-105 shadow-indigo-200"
              }`}
            >
              {isListening ? (
                <MicOff size={32} className="text-white" />
              ) : (
                <Mic size={32} className="text-white" />
              )}
            </button>
          </div>

          <p
            className={`mt-6 font-bold text-sm uppercase tracking-widest transition-colors ${
              isListening ? "text-red-500 animate-pulse" : "text-slate-400"
            }`}
          >
            {isListening ? "Ouvindo..." : "Clique para falar"}
          </p>
        </div>

        {/* Status */}
        <div className="text-center mb-4">
          {isListening && (
            <p className="text-interface-accent font-medium animate-pulse">
              Ouvindo... Fale agora!
            </p>
          )}
          {feedback && (
            <div
              className={`p-3 rounded-lg inline-flex items-center gap-2 ${
                feedback === "correct"
                  ? "bg-green-50 text-green-800"
                  : feedback === "partial"
                    ? "bg-yellow-50 text-yellow-800"
                    : "bg-red-50 text-red-800"
              }`}
            >
              {feedback === "correct" ? <Check size={20} /> : <X size={20} />}
              <span className="font-semibold">
                {feedback === "correct"
                  ? "Excelente!"
                  : feedback === "partial"
                    ? "Quase lá!"
                    : "Tente novamente."}
              </span>
            </div>
          )}
        </div>

        {transcript && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">
              Palavras reconhecidas corretamente:
            </div>
            {renderHighlightedText()}
          </div>
        )}

        {transcript && (
          <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
              O que o sistema entendeu:
            </div>
            <div className="text-lg text-indigo-900 font-medium italic">
              "{transcript}"
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-800">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {feedback && (
          <div className="flex justify-center">
            <button
              onClick={skipExercise}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Pular
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            if (currentExercise > 0) {
              setCurrentExercise(currentExercise - 1);
            }
          }}
          disabled={currentExercise === 0}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            currentExercise === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-interface-accent text-white hover:bg-interface-accent/90 cursor-pointer"
          }`}
        >
          <ChevronLeft size={20} className="inline mr-2" />
          Anterior
        </button>

        <span className="text-sm text-gray-600">
          {currentExercise + 1} / {content.exercises.length}
        </span>

        <button
          onClick={() => {
            if (currentExercise < content.exercises.length - 1) {
              setCurrentExercise(currentExercise + 1);
              setTranscript("");
              setFeedback(null);
            } else {
              onComplete?.();
            }
          }}
          disabled={!feedback || feedback === "incorrect"}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            !feedback || feedback === "incorrect"
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-interface-accent text-white hover:bg-interface-accent/90 cursor-pointer"
          }`}
        >
          {currentExercise === content.exercises.length - 1
            ? "Concluir"
            : "Próximo"}
          <ChevronRight size={20} className="inline ml-2" />
        </button>
      </div>
    </div>
  );
}
