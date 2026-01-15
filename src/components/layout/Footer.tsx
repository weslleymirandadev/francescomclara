import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaYoutube, FaWhatsapp, FaTiktok } from "react-icons/fa";

interface FooterProps {
  settings?: {
    instagramActive: boolean;
    instagramUrl: string;
    youtubeActive: boolean;
    youtubeUrl: string;
    whatsappActive: boolean;
    whatsappUrl: string;
    tiktokActive: boolean;
    tiktokUrl: string;
    supportEmail: string;
    highlightColor: string;
    siteIcon: string;
    interfaceIcon: string;
  }
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="w-full bg-s-50 border-t border-(--color-s-200) pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Coluna 1: Branding */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Image
                src={settings?.interfaceIcon || "/static/frança.png"}
                alt="Ícone de Interface"
                width={24}
                height={18}
                className="rounded-sm shadow-sm"
              />
              <span className="font-bold text-lg tracking-tight text-[var( --color-s-800)]uppercase flex items-center">
                Francês com 
                <span 
                  className="relative ml-1"
                  style={{ color: `var(${settings?.highlightColor})` }}
                >
                Clara
                <span className="absolute -top-1.5 -right-2.5 text-sm inline-block rotate-35 transition-transform group-hover:rotate-15">
                  {settings?.siteIcon}
                </span>
              </span>
            </span>
            </Link>
            <p className="text-[var(--color-s-50)]0 text-sm leading-relaxed font-medium">
              Transformando sua jornada no idioma francês com método prático, 
              contexto cultural e tecnologia.
            </p>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 className="font-bold text-s-900 mb-6 uppercase text-xs tracking-widest">Plataforma</h4>
            <ul className="space-y-4 text-sm font-semibold text-s-600">
              <li><Link href="/flashcards" className="hover:text-interface-accent transition-colors">Flashcards</Link></li>
              <li><Link href="/forum" className="hover:text-interface-accent transition-colors">Comunidade</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento */}
          <div>
            <h4 className="font-bold text-s-900 mb-6 uppercase text-xs tracking-widest">Atendimento</h4>
            <ul className="space-y-4 text-sm font-semibold text-s-600">
              <li>
                <a href={`mailto:${settings?.supportEmail}`} className="hover:text-interface-accent transition-colors flex flex-col">
                  <span className="text-[10px] text-s-400 uppercase tracking-tighter">E-mail de Suporte</span>
                  {settings?.supportEmail || "suporte@exemplo.com"}
                </a>
              </li>
              
              <div className="h-px bg-s-100 w-8 my-2" />

              <li><Link href="/privacidade" className="hover:text-interface-accent transition-colors">Privacidade & Termos</Link></li>
              <li><Link href="/configuracoes" className="hover:text-interface-accent transition-colors">Preferências</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Social com efeito Hover Tricolor */}
          <div>
            <h4 className="font-bold text-s-900 mb-6 uppercase text-xs tracking-widest">
              Redes Sociais
            </h4>
            <div className="flex gap-4">
              {[
                { 
                  icon: FaInstagram, 
                  active: settings?.instagramActive, 
                  href: settings?.instagramUrl 
                },
                { 
                  icon: FaYoutube, 
                  active: settings?.youtubeActive, 
                  href: settings?.youtubeUrl 
                },
                { 
                  icon: FaWhatsapp, 
                  active: settings?.whatsappActive, 
                  href: settings?.whatsappUrl 
                },
                { 
                  icon: FaTiktok, 
                  active: settings?.tiktokActive, 
                  href: settings?.tiktokUrl
                }
              ]
                .filter(social => social.active) 
                .map((social, index) => (
                  <a
                    key={index}
                    href={social.href as string || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-3 bg-white border border-s-200 rounded-xl transition-all duration-300 hover:border-interface-accent hover:drop-shadow-[-4px_4px_0_interface-accent]"
                  >
                    <social.icon 
                      size={20} 
                      className="text-s-400 group-hover:text-interface-accent transition-colors" 
                    />
                  </a>
                ))}
            </div>
          </div>
        </div>

        {/* Linha Inferior: Copyright e Bandeira Decorativa */}
        <div className="pt-8 border-t border-s-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-s-400 text-xs font-bold uppercase tracking-tighter">
            © 2026 Francês com Clara. Todos os direitos reservados.
          </p>
          
          {/* Detalhe minimalista tricolor */}
          <div className="flex h-1 w-24">
            <div className="flex-1 bg-interface-accent"></div>
            <div className="flex-1 bg-white border-y border-(--color-s-100)"></div>
            <div className="flex-1 bg-[#EF4135]"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}