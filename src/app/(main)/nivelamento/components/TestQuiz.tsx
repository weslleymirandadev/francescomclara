"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResultCard from "./ResultCard";

export default function TestQuiz({ initialQuestions }: { initialQuestions: any[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentStep < initialQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return <ResultCard questions={initialQuestions} answers={answers} />;
  }

  const question = initialQuestions[currentStep];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-12 space-y-4">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Questão {currentStep + 1} de {initialQuestions.length}</span>
          <span>{Math.round(((currentStep + 1) / initialQuestions.length) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / initialQuestions.length) * 100}%` }}
            className="h-full bg-(--interface-accent)"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
            {question.text}
          </h2>

          <div className="grid gap-3">
            {question.options.map((option: string, index: number) => (
              <motion.button
                key={index}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(index)}
                className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-(--interface-accent) hover:shadow-xl transition-all text-left"
              >
                <span className="font-bold text-slate-700">{option}</span>
                <div className="w-8 h-8 rounded-full border-2 border-slate-100 group-hover:border-(--interface-accent) flex items-center justify-center transition-colors">
                  <div className="w-2 h-2 rounded-full bg-(--interface-accent) opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}