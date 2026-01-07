import { TrackObjective } from "@prisma/client";
import { GiCroissant, GiFleurDeLys, GiWineGlass } from "react-icons/gi";
import { IoIosAirplane } from "react-icons/io";
import { LuImagePlus, LuTrash2 } from "react-icons/lu";
import { updateObjectiveImageAction, resetObjectiveImageAction } from "./actions";

const THEMES = {
  TRAVEL: { label: "Viagens", defaultImg: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=75", Icon: IoIosAirplane, rotate: "rotate-[15deg]", IconRotate: "rotate-[-10deg]" },
  WORK: { label: "Trabalho", defaultImg: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=75", Icon: GiFleurDeLys, rotate: "rotate-[0deg]", IconRotate: "rotate-[0]" },
  FAMILY: { label: "Família", defaultImg: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=75", Icon: GiWineGlass, rotate: "rotate-[-20deg]", IconRotate: "rotate-[50deg]" },
  KNOWLEDGE: { label: "Conhecimento", defaultImg: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=75", Icon: GiCroissant, rotate: "rotate-[-15deg]", IconRotate: "rotate-[150deg]" },
};

interface BannerProps {
  objective: TrackObjective;
  currentImg?: string;
}

export default function ObjectiveBanner({ objective, currentImg }: BannerProps) {
  const theme = THEMES[objective];
  const IconComponent = theme.Icon;
  const isCustomImage = !!currentImg && currentImg !== "";
  const displayImg = isCustomImage ? currentImg : theme.defaultImg;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await updateObjectiveImageAction(objective, base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-80 mb-10 group">
      <div className="relative w-full h-full overflow-hidden rounded-[40px] bg-s-900 shadow-sm">
        <div 
          className="absolute inset-0 opacity-40 transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${displayImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40"
          title="Arraste uma imagem ou clique para mudar"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
          <div className="flex flex-col items-center gap-2 text-white bg-black/40 p-6 rounded-3xl backdrop-blur-md border border-white/10">
            <LuImagePlus size={32} />
            <span className="font-black text-[10px] uppercase tracking-widest">Arraste para mudar o fundo</span>
          </div>
        </div>

        {isCustomImage && (
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if(confirm("Voltar para a imagem padrão?")) await resetObjectiveImageAction(objective);
            }}
            className="absolute top-6 right-8 z-50 p-4 bg-red-500/80 hover:bg-red-600 text-white rounded-2xl backdrop-blur-md transition-all shadow-xl"
          >
            <LuTrash2 size={20} />
          </button>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute bottom-8 left-16 z-10">
          <span className="text-[10px] font-black uppercase text-interface-accent tracking-[0.4em] block mb-1">Objectif</span>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter font-frenchpress leading-none">
            {theme.label}
          </h2>
        </div>
      </div>
      
      {/* SEUS ÍCONES DE RECORTE (Mantidos exatamente iguais) */}
      <div className={`absolute -bottom-8 -left-8 z-30 text-white ${theme.rotate}`}>
        <div className="bg-white p-4 rounded-4xl">
          <IconComponent size={50} className="text-s-900" />
        </div>
      </div>
      <div className={`absolute -bottom-18 -right-10 z-30 text-white ${theme.IconRotate}`}>
        <IconComponent size={160} />
      </div>
      <div className="absolute -top-4 right-20 z-30 text-white">
        <IconComponent size={50} className="rotate-[15deg]" />
      </div>
    </div>
  );
}