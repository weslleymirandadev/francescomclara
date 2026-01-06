import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full bg-[var(--color-s-50)] border-t border-[var(--color-s-200)] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Coluna 1: Branding */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Image
                src="/static/frança.png"
                alt="Bandeira França"
                width={24}
                height={18}
                className="rounded-sm shadow-sm"
              />
              <span className="font-bold text-lg tracking-tight text-[var( --color-s-800)]uppercase flex items-center">
                Francês com 
                <span className="relative ml-1 text-[var(--clara-rose)]">
                Clara
                <span className="absolute -top-1.5 -right-2.5 text-sm inline-block rotate-35 transition-transform group-hover:rotate-[15deg]">
                    🌸
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
            <h4 className="font-bold text-[var(--color-s-900)] mb-6 uppercase text-xs tracking-widest">Plataforma</h4>
            <ul className="space-y-4 text-sm font-semibold text-[var(--color-s-600)]">
              <li><Link href="/minha-trilha" className="hover:text-[var(--interface-accent)] transition-colors">Minha Trilha</Link></li>
              <li><Link href="/flashcards" className="hover:text-[var(--interface-accent)] transition-colors">Flashcards</Link></li>
              <li><Link href="/forum" className="hover:text-[var(--interface-accent)] transition-colors">Comunidade</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div>
            <h4 className="font-bold text-[var(--color-s-900)] mb-6 uppercase text-xs tracking-widest">Suporte</h4>
            <ul className="space-y-4 text-sm font-semibold text-[var(--color-s-600)]">
              <li><Link href="/ajuda" className="hover:text-[var(--interface-accent)] transition-colors">Central de Ajuda</Link></li>
              <li><Link href="/configuracoes" className="hover:text-[var(--interface-accent)] transition-colors">Configurações</Link></li>
              <li><Link href="/privacidade" className="hover:text-[var(--interface-accent)] transition-colors">Privacidade</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Social com efeito Hover Tricolor */}
          <div>
            <h4 className="font-bold text-[var(--color-s-900)] mb-6 uppercase text-xs tracking-widest">Redes Sociais</h4>
            <div className="flex gap-4">
            {[
                { icon: FaInstagram, color: "#E4405F", href: "#" },
                { icon: FaYoutube, color: "#FF0000", href: "#" },
                { icon: FaWhatsapp, color: "#25D366", href: "#" }
            ].map((social, index) => (
                <a
                key={index}
                href={social.href}
                className="group relative p-3 bg-white border border-[var(--color-s-200)] rounded-xl transition-all duration-300 hover:border-[var(--interface-accent)] hover:drop-shadow-[-4px_4px_0_var(--interface-accent)]"
                >
                <social.icon 
                    size={20} 
                    className="text-[var(--color-s-400)] group-hover:text-[var(--interface-accent)] transition-colors" 
                />
                </a>
            ))}
            </div>
          </div>
        </div>

        {/* Linha Inferior: Copyright e Bandeira Decorativa */}
        <div className="pt-8 border-t border-[var(--color-s-200)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[var(--color-s-400)] text-xs font-bold uppercase tracking-tighter">
            © 2026 Francês com Clara. Todos os direitos reservados.
          </p>
          
          {/* Detalhe minimalista tricolor */}
          <div className="flex h-1 w-24">
            <div className="flex-1 bg-[var(--interface-accent)]"></div>
            <div className="flex-1 bg-white border-y border-[var(--color-s-100)]"></div>
            <div className="flex-1 bg-[#EF4135]"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}