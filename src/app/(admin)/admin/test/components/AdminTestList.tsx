"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuestionModal from "./QuestionModal";
import { deleteQuestion } from "../actions";
import { toast } from "react-hot-toast";

export default function AdminTestList({ initialQuestions, testId }: { initialQuestions: any[], testId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const handleEdit = (question: any) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedQuestion(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta pergunta?")) {
      const res = await deleteQuestion(id);
      if (res.success) toast.success("Excluída com sucesso!");
      else toast.error("Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 text-blue-600 w-full sm:w-auto">
          <Info size={20} className="shrink-0" />
          <p className="text-xs font-black uppercase tracking-tight">
            {initialQuestions.length} Questões cadastradas
          </p>
        </div>
        
        <Button 
          onClick={handleAdd}
          className="w-full sm:w-auto h-14 sm:h-12 px-6 rounded-2xl bg-interface-accent hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-interface-accent/20"
        >
          <Plus size={18} className="mr-2" />
          Nova Pergunta
        </Button>
      </div>

      <div className="grid gap-4">
        {initialQuestions.map((q) => (
          <motion.div 
            layout
            key={q.id}
            className="bg-white p-4 md:p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex gap-4 md:gap-6 items-start flex-1">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">LVL</span>
                <span className="text-sm font-black text-interface-accent">{q.levelAssigned}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-lg tracking-tight mb-3 wrap-break-word leading-tight">
                  {q.text}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt: string, idx: number) => (
                    <span 
                      key={idx} 
                      className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border ${
                        idx === q.correctOption 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
              <Button 
                variant="secondary"
                onClick={() => handleEdit(q)}
                className="flex-1 md:w-12 md:h-12 md:p-0 rounded-2xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
              >
                <Edit2 size={18} />
                <span className="md:hidden ml-2 font-black text-[10px] uppercase">Editar</span>
              </Button>
              <Button 
                variant="secondary"
                onClick={() => handleDelete(q.id)}
                className="flex-1 md:w-12 md:h-12 md:p-0 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
              >
                <Trash2 size={18} />
                <span className="md:hidden ml-2 font-black text-[10px] uppercase">Excluir</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <QuestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        question={selectedQuestion}
        testId={testId}
      />
    </div>
  );
}