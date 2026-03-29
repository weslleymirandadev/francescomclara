"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "../actions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ResultCard({ questions, answers }: any) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { update } = useSession(); // Hook para atualizar a sessão no cliente

  // Cálculo de acertos
  const score = answers.filter((ans: any, i: any) => ans === questions[i].correctOption).length;
  
  // Lógica de cálculo de nível
  const percent = (score / questions.length) * 100;
  let finalLevel = "A1";
  let levelName = "Iniciante";

  if (percent > 85) {
    finalLevel = "B2";
    levelName = "Avançado";
  } else if (percent > 60) {
    finalLevel = "B1";
    levelName = "Intermediário";
  } else if (percent > 30) {
    finalLevel = "A2";
    levelName = "Elementar";
  }

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const result = await completeOnboarding(finalLevel);
      
      if (result.success) {
        await update({
          level: finalLevel,
          onboarded: true
        });

        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Erro: " + result.error);
      }
    } catch (error) {
      alert("Erro ao salvar o resultado.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-slate-50"
    >
      <div className="w-20 h-20 bg-blue-50 text-(--interface-accent) rounded-full flex items-center justify-center mx-auto mb-6">
        <Trophy size={40} />
      </div>
      
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">
        Resultado do Teste
      </h2>
      
      <p className="text-slate-500 font-medium mb-8">
        Acertaste {score} de {questions.length} questões.
      </p>
      
      <div className="p-6 bg-slate-50 rounded-[2rem] mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
          O teu nível é
        </span>
        <span className="text-2xl font-black text-(--interface-accent) uppercase">
          {levelName} ({finalLevel})
        </span>
      </div>

      <Button 
        onClick={handleFinish}
        disabled={isSaving}
        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            A atualizar perfil...
          </>
        ) : (
          "Começar minha jornada"
        )}
      </Button>
    </motion.div>
  );
}