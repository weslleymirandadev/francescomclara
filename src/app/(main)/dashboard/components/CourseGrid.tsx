import { FiLock } from 'react-icons/fi';

export function CourseGrid({ tracks, onSelect, userLevel }: any) {
  const LEVEL_WEIGHT: any = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tracks.map((track: any) => {
        const isLocked = LEVEL_WEIGHT[track.cefrLevel] > LEVEL_WEIGHT[userLevel || 'A1'];

        return (
          <div
            key={track.id}
            onClick={() => !isLocked && onSelect(track)}
            className={`cursor-pointer group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl transition-all hover:shadow-2xl ${
              isLocked ? 'opacity-60 grayscale' : ''
            }`}
          >
            <div className="relative h-48 overflow-hidden">
              <img src={track.imageUrl || '/placeholder.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={track.name} />
              <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                {track.cefrLevel}
              </div>
              {isLocked && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
                  <FiLock size={24} className="mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Nível {track.cefrLevel} Necessário</p>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-tight">{track.name}</h3>
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                <span>{track.modules?.length || 0} Módulos</span>
                <span className="text-(--interface-accent)">Acessar →</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}