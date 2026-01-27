"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";
import { saveQuestion } from "../actions";
import { toast } from "react-hot-toast";

export default function QuestionModal({ isOpen, onClose, question, testId }: any) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [level, setLevel] = useState("A1");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    if (question) {
      setText(question.text);
      setLevel(question.levelAssigned);
      setOptions(question.options);
      setCorrect(question.correctOption);
    } else {
      setText("");
      setLevel("A1");
      setOptions(["", "", "", ""]);
      setCorrect(0);
    }
  }, [question, isOpen]);

  const handleSave = async () => {
    if (!text || options.some(o => !o)) {
      return toast.error("Preenche todos os campos!");
    }

    setLoading(true);
    const result = await saveQuestion({
      id: question?.id,
      text,
      options,
      correctOption: correct,
      levelAssigned: level,
      testId: testId,
    });

    if (result.success) {
      toast.success("Pergunta guardada!");
      onClose();
    } else {
      toast.error("Algo correu mal.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] p-8 max-w-2xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900">
            {question ? "Editar Questão" : "Nova Questão"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pergunta</label>
            <Input 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: Como se conjuga o verbo..."
              className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nível Sugerido</label>
            <select 
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="A1">A1 - Iniciante</option>
              <option value="A2">A2 - Elementar</option>
              <option value="B1">B1 - Intermediário</option>
              <option value="B2">B2 - Avançado</option>
            </select>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-400 ml-1">Alternativas (Marca a correta)</p>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-3">
                <button 
                  onClick={() => setCorrect(i)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${correct === i ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                >
                  <CheckCircle2 size={20} />
                </button>
                <Input 
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    setOptions(newOpts);
                  }}
                  placeholder={`Opção ${i + 1}`}
                  className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={loading} className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
            {loading ? <Loader2 className="animate-spin" /> : "Guardar Pergunta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}