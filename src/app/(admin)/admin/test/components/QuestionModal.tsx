"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, Award, AlignLeft } from "lucide-react";
import { saveQuestion } from "../actions";
import { toast } from "react-hot-toast";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

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
      testId
    });

    setLoading(false);
    if (result.success) {
      toast.success(question ? "Atualizada!" : "Criada!");
      onClose();
    } else {
      toast.error("Erro ao salvar.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[90vw] md:w-full max-h-[70vh] md:max-h-[90vh] overflow-y-auto rounded-[32px] p-4 md:p-8 gap-0 border-none shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
            {question ? "Modifier Question" : "Nouvelle Question"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                <Award size={12} /> Niveau CEFR
              </label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none px-4 font-black text-interface-accent focus:ring-2 focus:ring-interface-accent/20">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl font-bold text-slate-600">
                  {LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl} className="rounded-xl focus:bg-slate-50">
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-8 space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                <AlignLeft size={12} /> Énoncé
              </label>
              <Input 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: Qual o significado de..."
                className="h-12 rounded-2xl bg-slate-50 border-none px-4 font-medium focus-visible:ring-2 focus-visible:ring-interface-accent/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest mb-4">
              Alternatives (Clique no ícone para definir a correta)
            </p>
            
            <div className="grid gap-3">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-3">
                  <button 
                    onClick={() => setCorrect(i)}
                    className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      correct === i 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                    }`}
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
                    placeholder={`Option ${i + 1}`}
                    className={`h-12 rounded-2xl border-none px-4 font-medium transition-all ${
                      correct === i ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-600'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 pt-6 border-t border-slate-50 flex-col md:flex-row gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full md:w-auto h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400"
          >
            Annuler
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full md:flex-1 h-14 bg-slate-900 hover:bg-interface-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (question ? "Mettre à jour" : "Créer Question")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}