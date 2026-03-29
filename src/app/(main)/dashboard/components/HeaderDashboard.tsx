import { FaChevronLeft, FaSearch } from "react-icons/fa";

interface HeaderDashboardProps {
  name: string | null;
  isInsideTrack: boolean;
  onBack: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function HeaderDashboard({ 
  name, 
  isInsideTrack, 
  onBack, 
  searchTerm, 
  setSearchTerm 
}: HeaderDashboardProps) {
  
  if (isInsideTrack) {
    return (
      <div className="flex items-center gap-6 mb-12 animate-in fade-in slide-in-from-left-4">
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-900 hover:bg-(--interface-accent) hover:text-white transition-all group"
        >
          <FaChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Voltar ao <span className="text-(--interface-accent)">Painel</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
            Explore suas outras trilhas e atividades
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
          Bonjour, <span className="text-(--interface-accent)">{name?.split(' ')[0]}!</span>
        </h1>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
          Pronto para continuar sua jornada no Francês?
        </p>
      </div>

      <div className="relative w-full md:w-80">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="BUSCAR CURSOS..."
          className="w-full pl-12 pr-4 h-14 bg-white border-none shadow-xl rounded-2xl font-bold text-xs uppercase tracking-widest placeholder:text-slate-300 focus:ring-2 focus:ring-(--interface-accent) transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}