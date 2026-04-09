// src/components/forum/UserProfileModal.tsx
import { FiX, FiMapPin, FiCalendar } from "react-icons/fi";

export default function UserProfileModal({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="h-40 w-full bg-slate-200 relative">
          {user.banner ? (
            <img
              src={user.banner}
              className="w-full h-full object-cover"
              alt="Banner"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-(--clara-rose) to-rose-400 opacity-20" />
          )}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-10 pb-10">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-[2.5rem] border-8 border-white bg-white shadow-xl overflow-hidden">
              {user.image ? (
                <img
                  src={user.image}
                  className="w-full h-full object-cover"
                  alt={user.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-4xl font-black">
                  {user.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-24 bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-tighter shadow-lg">
              Nível {user.level || "A1"}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                {user.name}
              </h2>
              <p className="text-sm font-bold text-(--clara-rose) uppercase tracking-widest mt-1">
                @{user.username || "estudante"}
              </p>
            </div>

            {user.bio ? (
              <p className="text-slate-500 font-medium leading-relaxed italic">
                "{user.bio}"
              </p>
            ) : (
              <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                Sem biografia definida.
              </p>
            )}

            <div className="flex gap-6 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400">
                <FiCalendar size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Desde{" "}
                  {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
