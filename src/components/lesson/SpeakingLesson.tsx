"use client";

import { useState, useEffect } from "react";
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

let globalRecognition: any = null;

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
    // Calcula similaridade usando distância de Levenshtein simplificada
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
    const currentExerciseData = exercise;
    if (!currentExerciseData?.french) return;

    const normalizedSpoken = normalizeText(spokenText);
    const normalizedExpected = normalizeText(currentExerciseData.french);

    const similarityScore = calculateSimilarity(
      normalizedSpoken,
      normalizedExpected,
    );
    console.log("SIMILARITY REAL:", Math.round(similarityScore * 100) + "%");

    const expectedWords = normalizedExpected.split(/\s+/);
    const spokenWords = normalizedSpoken.split(/\s+/);

    let correctCount = 0;
    const correctWordIndices = new Set<number>();

    expectedWords.forEach((word, index) => {
      const found = spokenWords.some(
        (spoken) =>
          spoken === word ||
          spoken.replace(/s$/, "") === word.replace(/s$/, ""),
      );

      if (found) {
        correctCount++;
        correctWordIndices.add(index);
      }
    });

    const accuracy = correctCount / expectedWords.length;

    const isCorrect = similarityScore > 0.8 || accuracy >= 0.8;

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
      setFeedback(accuracy > 0.4 ? "partial" : "incorrect");
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    }
  };

  useEffect(() => {
    try {
      console.log("=== USE EFFECT STARTED ===");
      console.log("Window check:", typeof window !== "undefined");
      console.log(
        "SpeechRecognition check:",
        "webkitSpeechRecognition" in window,
        "SpeechRecognition" in window,
      );

      if (
        typeof window !== "undefined" &&
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        console.log("NO SPEECH SUPPORT - setting error");
        setIsSupported(false);
        setError(
          "Seu navegador não suporta reconhecimento de voz. Tente usar Chrome ou Edge.",
        );
        return;
      }

      console.log("SPEECH SUPPORT CONFIRMED");

      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "fr-FR";
        recognitionInstance.maxAlternatives = 3;

        console.log("Speech Recognition Language Support:", {
          configuredLang: recognitionInstance.lang,
          isChrome: !!(window as any).chrome,
          userAgent: navigator.userAgent,
        });

        recognitionInstance.onstart = () => {
          setIsListening(true);
          setTranscript("");
          setError(null);
          console.log(
            "Speech recognition started with language:",
            recognitionInstance.lang,
          );
        };

        recognitionInstance.onresult = (event: any) => {
          console.log("SPEECH DETECTED!");

          const result = event.results[event.resultIndex];
          const transcript = result[0].transcript;
          const isFinal = result.isFinal;

          console.log("TRANSCRIPT:", transcript, "FINAL:", isFinal);

          setTranscript(transcript);

          if (isFinal) {
            console.log("FINAL RESULT - CHECKING ANSWER");
            setIsListening(false);
            checkAnswer(transcript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);

          switch (event.error) {
            case "no-speech":
              setError("Nenhum áudio detectado. Tente novamente.");
              break;
            case "audio-capture":
              setError("Erro ao capturar áudio. Verifique seu microfone.");
              break;
            case "not-allowed":
              setError("Permissão para usar o microfone foi negada.");
              break;
            default:
              setError("Ocorreu um erro no reconhecimento de voz.");
          }
        };

        recognitionInstance.onend = () => {
          console.log("Speech recognition ended");
          setIsListening(false);
        };

        recognitionInstance.onsoundstart = () => {
          console.log("Speech detection: sound started");
        };

        recognitionInstance.onsoundend = () => {
          console.log("Speech detection: sound ended");
        };

        recognitionInstance.onspeechstart = () => {
          console.log("Speech detection: speech started");
        };

        recognitionInstance.onspeechend = () => {
          console.log("Speech detection: speech ended");
        };

        setRecognition(recognitionInstance);

        return () => {
          console.log("=== COMPONENT UNMOUNTED ===");
          console.log("SpeakingLesson component unmounted/cleanup");
          if (recognitionInstance) {
            recognitionInstance.abort();
          }
        };
      }
    } catch (error) {
      console.error("USE EFFECT ERROR:", error);
      setError("Erro ao inicializar reconhecimento de voz: " + error);
    }
  }, []);

  useEffect(() => {
    setTranscript("");
    setFeedback(null);
    setShowHints(false);
  }, [currentExercise]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        if (globalRecognition) {
          globalRecognition.abort();
        }

        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.lang = "fr-FR";
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptText;
              checkAnswer(finalTranscript);
            } else {
              interimTranscript += transcriptText;
            }
          }

          setTranscript(finalTranscript || interimTranscript);
        };

        recognitionInstance.onerror = (event: any) => {
          if (event.error !== "no-speech") {
            console.error("Speech recognition error:", event.error);
          }
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          console.log("Mic encerrou oficialmente.");
        };

        globalRecognition = recognitionInstance;
        setRecognition(recognitionInstance);
      }
    }

    return () => {
      if (globalRecognition) {
        globalRecognition.abort();
      }
    };
  }, [currentExercise]);

  useEffect(() => {
    // Carregar resposta salva se existir
    setExercise(content.exercises[currentExercise]);
    const savedAnswer = savedAnswers.get(currentExercise);
    if (savedAnswer) {
      setTranscript(savedAnswer.userAnswer);
      setFeedback(savedAnswer.isCorrect ? "correct" : "incorrect");
      setShowHints(true); // Mostrar hints se já foi respondida

      // Se já foi respondida corretamente, precisamos recalcular as palavras corretas
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

  // Carregar respostas salvas quando o componente montar ou quando lessonId mudar
  useEffect(() => {
    if (session?.user?.id && lessonId) {
      loadSavedAnswers();
    }
  }, [session?.user?.id, lessonId]);

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
    if (!recognition) return;

    try {
      window.speechSynthesis.cancel();

      setTranscript("");
      setIsListening(true);

      recognition.stop();

      setTimeout(() => {
        recognition.start();
      }, 100);
    } catch (error) {
      console.error("Erro ao iniciar mic:", error);
      setCurrentExercise(currentExercise);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      recognition.onresult = null;
      recognition.onend = null;
    }
    setIsListening(false);
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

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      recognition?.stop();
    } else {
      setIsListening(true);
      setTranscript("");
      try {
        recognition?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const playAudio = (text: string) => {
    if (globalRecognition) {
      globalRecognition.stop();
      globalRecognition.abort();
    }
    setIsListening(false);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";

    utterance.onstart = () => {
      console.log("Clara falando... Mic bloqueado.");
    };

    window.speechSynthesis.speak(utterance);
  };

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
            onClick={onComplete}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Pular Exercício
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
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
        {/* Difficulty Badge */}
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

        {/* Target Phrase */}

        <div className="flex items-center gap-4 mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Fale esta frase em francês:
            </h3>
            <div className="text-2xl font-medium text-gray-800 mb-2">
              {exercise.french}
            </div>
            <p className="text-sm text-gray-600">{exercise.portuguese}</p>
          </div>
          <button
            onClick={() => playAudio(exercise.french)}
            className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors active:scale-90"
            title="Ouvir pronúncia"
          >
            <Volume2 size={24} />
          </button>
        </div>

        {/* Hints Section */}
        {exercise.hints.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowHints(!showHints)}
              className="text-sm text-interface-accent hover:text-interface-accent/80 font-medium"
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

        {/* Microphone Button */}
        <div className="flex flex-col items-center justify-center my-10">
          <div className="relative flex items-center justify-center w-32 h-32">
            {/* Ondas estilo WhatsApp */}
            {isListening && (
              <>
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                <span className="absolute inline-flex h-24 w-24 rounded-full bg-red-400 opacity-50 animate-[ping_1.5s_linear_infinite]"></span>
                <span className="absolute inline-flex h-16 w-16 rounded-full bg-red-400 opacity-30 animate-[ping_2s_linear_infinite]"></span>
              </>
            )}

            {/* Botão do Microfone */}
            <button
              onClick={toggleListening}
              className={`relative z-10 p-8 rounded-full transition-all duration-300 shadow-xl ${
                isListening
                  ? "bg-red-500 scale-110 shadow-red-500/50"
                  : "bg-interface-accent hover:scale-105 shadow-slate-200"
              } text-white`}
            >
              {isListening ? (
                <Mic size={40} className="animate-bounce" />
              ) : (
                <MicOff size={40} />
              )}
            </button>
          </div>

          <p
            className={`mt-4 text-xs font-black uppercase tracking-widest ${isListening ? "text-red-500 animate-pulse" : "text-slate-400"}`}
          >
            {isListening ? "Clara está te ouvindo..." : "Toque para falar"}
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
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-sm text-slate-500 mb-1 font-bold uppercase tracking-wider">
              Eu entendi:
            </p>
            <p
              className={`text-lg ${isListening ? "text-blue-600 italic" : "text-slate-900 font-bold"}`}
            >
              "{transcript}"
              {isListening && <span className="animate-pulse">...</span>}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="my-3 mb-6 p-4 bg-red-50 rounded-lg text-red-800">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {feedback && (
          <div className="flex justify-center">
            <button
              onClick={skipExercise}
              className="my-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Pular
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
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
              : "bg-interface-accent text-white hover:bg-interface-accent/90"
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
            } else {
              onComplete?.();
            }
          }}
          disabled={!feedback || feedback === "incorrect"}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            !feedback || feedback === "incorrect"
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-interface-accent text-white hover:bg-interface-accent/90"
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
