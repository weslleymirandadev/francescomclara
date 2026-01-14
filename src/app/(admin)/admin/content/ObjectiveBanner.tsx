import * as GiIcons from "react-icons/gi";
import { useState, useEffect } from "react";
import { LuImagePlus, LuTrash2, LuX, LuSearch } from "react-icons/lu";
import { Icon } from '@iconify/react';
import { updateObjectiveImageAction, resetObjectiveImageAction, updateObjectiveSettingsAction } from "./actions";

interface BannerProps {
  objective: any;
  currentImg?: string | null;
  onSettingsChange: (settings: { 
    icon?: string; 
    iconRotate?: number; 
    rotation?: number;
    imageUrl?: string
  }) => void;
}

export default function ObjectiveBanner({ objective, currentImg, onSettingsChange }: BannerProps) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


   const QUICK_SUGGESTIONS = [
    'ph:airplane-tilt-fill', 'ph:briefcase-fill', 'ph:heart-fill', 
    'ph:graduation-cap-fill', 'ph:camera-fill', 'ph:wine-fill',
    'ph:leaf-fill', 'ph:palette-fill', 'ph:globe-stand-fill'
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length > 2) {
        setIsLoading(true);
        try {
          const response = await fetch(`https://api.iconify.design/search?query=${search}&limit=24`);
          const data = await response.json();
          setSearchResults(data.icons || []);
        } catch (error) {
          console.error("Erro ao buscar ícones", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  if (!objective) return null;

  const renderIcon = (iconName: string, size: number, className?: string, style?: any) => {
    if (iconName?.includes(':')) {
      return <Icon icon={iconName} width={size} height={size} className={className} style={style} />;
    }
    return <Icon icon={`gi:${iconName?.toLowerCase().replace('gi','')}`} width={size} height={size} className={className} style={style} />;
  };

  const isCustomImage = !!currentImg || (!!objective.imageUrl && objective.imageUrl !== "");
  const displayImg = objective.imageUrl || currentImg;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onSettingsChange({ imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };
  
  return (
      <div className="relative w-full h-80 mb-10 group">
          <div className="absolute top-6 left-8 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
            onClick={() => setIsOpen(true)}
            className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/40 transition-all"
          >
            Trocar Ícone
          </button>
          
          <div className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest">Girar:</span>
            <input 
              type="range" 
              min="0" 
              max="360" 
              value={objective.rotation || 0}
              onChange={(e) => {
                onSettingsChange({ rotation: parseInt(e.target.value) });
              }}
              className="w-24 accent-interface-accent cursor-pointer"
            />
          </div>
          {isOpen && (
            <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl border border-s-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-s-900 font-black uppercase text-xs tracking-[0.2em]">Seletor de Ícones</h3>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-s-100 rounded-full transition-colors">
                    <LuX size={20} className="text-s-400" />
                  </button>
                </div>
                
                <div className="relative mb-6">
                  <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-s-600" size={20} />
                  <input 
                    type="text"
                    placeholder="Pesquisar (ex: travel, food, star)..."
                    className="w-full bg-s-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 ring-interface-accent transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {(searchResults.length > 0 ? searchResults : QUICK_SUGGESTIONS).map(iconName => (
                    <button 
                      key={iconName}
                      onClick={async () => {
                        onSettingsChange({ icon: iconName });
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className="p-4 bg-s-100 hover:bg-interface-accent rounded-3xl flex flex-col items-center justify-center transition-all hover:scale-105 [&>svg]:text-s-900 hover:[&>svg]:text-white"
                    >
                      <Icon 
                        icon={iconName} 
                        width={32} 
                        height={32} 
                        className="transition-colors" 
                      />
                    </button>
                  ))}
                  {isLoading && <div className="col-span-4 text-center py-4 text-s-400 text-[10px] font-bold uppercase">Buscando...</div>}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="relative w-full h-full overflow-hidden rounded-[40px] bg-s-900 shadow-sm">
          <div 
            className="absolute inset-0 opacity-40 transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${displayImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageUpload}
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
                if(confirm("Deseja remover a imagem personalizada e voltar ao padrão?")) {
                  await resetObjectiveImageAction(objective.id);
                }
              }}
              className="absolute top-6 right-8 z-50 p-4 bg-red-500/80 hover:bg-red-600 text-white rounded-2xl backdrop-blur-md transition-all shadow-xl flex items-center gap-2 group/btn"
            >
              <LuTrash2 size={20} />
              <span className="max-w-0 overflow-hidden group-hover/btn:max-w-xs transition-all duration-500 whitespace-nowrap text-[10px] font-black uppercase tracking-widest">
                Remover Fundo
              </span>
            </button>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute bottom-8 left-16 z-10">
            <span className="text-[10px] font-black uppercase text-interface-accent tracking-[0.4em] block mb-1">Objectif</span>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter font-frenchpress leading-none">
              {objective.name}
            </h2>
          </div>
        </div>
        
        <div 
          className="absolute -bottom-8 -left-8 z-30 text-white transition-transform duration-500"
          style={{ transform: `rotate(${objective.iconRotate || 0}deg)` }}
        >
          <div className="bg-white p-4 rounded-4xl">
            {renderIcon(objective.icon, 50, "text-s-900")}
          </div>
        </div>
        <div 
          className="absolute -bottom-18 -right-10 z-30 text-white transition-transform duration-500"
          style={{ transform: `rotate(${objective.rotation || 0}deg)` }}
        >
          {renderIcon(objective.icon, 160)}
        </div>
        <div className="absolute -top-4 right-20 z-30 text-white">
          {renderIcon(objective.icon, 50, "rotate-[15deg]")}
        </div>
      </div>
  );
}