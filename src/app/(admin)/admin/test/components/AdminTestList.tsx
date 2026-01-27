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
      <div className="flex justify-between items-center">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 text-blue-600">
          <Info size={20} />
          <p className="text-xs font-bold uppercase tracking-tight">
            As perguntas aparecem para o aluno na ordem em que foram criadas.
          </p>
        </div>
        <Button 
          onClick={handleAdd}
          className="bg-slate-900 text-white rounded-2xl px-6 h-12 font-black uppercase text-[10px] tracking-widest"
        >
          <Plus size={16} className="mr-2" /> Adicionar Questão
        </Button>
      </div>

      <div className="grid gap-4">
        {initialQuestions.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white border border-slate-100 p-6 rounded-[2.5rem] flex items-center justify-between hover:shadow-2xl hover:border-(--interface-accent) transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
                <span className="text-[8px] font-black text-slate-400 uppercase">Nível</span>
                <span className="text-lg font-black text-(--interface-accent)">{q.levelAssigned}</span>
              </div>
              
              <div>
                <h3 className="font-bold text-slate-800 text-lg tracking-tight mb-1">{q.text}</h3>
                <div className="flex gap-2">
                  {q.options.map((opt: string, idx: number) => (
                    <span key={idx} className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${idx === q.correctOption ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => handleEdit(q)}
                className="h-12 w-12 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <Edit2 size={18} />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleDelete(q.id)}
                className="h-12 w-12 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <Trash2 size={18} />
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