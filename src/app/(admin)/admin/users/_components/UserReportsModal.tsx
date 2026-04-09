"use client";
import { FiX, FiMessageSquare, FiFileText } from "react-icons/fi";

export function UserReportsModal({ isOpen, onClose, data, userName }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              Denúncias
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {userName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {data.commentReports.map((rep: any) => (
            <div
              key={rep.id}
              className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50 space-y-2"
            >
              <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase">
                <FiMessageSquare size={14} /> Comentário Reportado
              </div>
              <p className="text-sm text-slate-700 italic">
                "{rep.comment.content}"
              </p>
              <div className="pt-2 border-t border-rose-100/50">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Motivo:
                </span>
                <p className="text-xs font-medium text-slate-600">
                  {rep.reason}
                </p>
              </div>
            </div>
          ))}

          {data.postReports.map((rep: any) => (
            <div
              key={rep.id}
              className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50 space-y-2"
            >
              <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase">
                <FiFileText size={14} /> Post Reportado
              </div>
              <p className="text-sm text-slate-800 font-bold">
                {rep.post.title}
              </p>
              <div className="pt-2 border-t border-amber-100/50">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Motivo:
                </span>
                <p className="text-xs font-medium text-slate-600">
                  {rep.reason}
                </p>
              </div>
            </div>
          ))}

          {data.commentReports.length === 0 &&
            data.postReports.length === 0 && (
              <p className="text-center text-slate-400 py-10 text-sm">
                Nenhum detalhe encontrado.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
