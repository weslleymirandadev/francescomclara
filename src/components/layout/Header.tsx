"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

import { FaRegClone } from "react-icons/fa";
import { FiUser as User, FiLogOut } from "react-icons/fi";
import { HiOutlineCog, HiMenu, HiX } from "react-icons/hi";
import { RiSecurePaymentFill } from "react-icons/ri";
import { BiDirections } from "react-icons/bi";

interface HeaderProps {
  settings?: {
    siteIcon: string;
    highlightColor: string;
  }
}

const navigationItems = [
  { href: "/perfil", icon: User, text: "Perfil" },
  { href: "/flashcards", icon: FaRegClone, text: "Flashcards" },
  { href: "/minha-trilha", icon: BiDirections, text: "Minha Trilha" },
  { href: "/configuracoes", icon: HiOutlineCog, text: "Configurações" },
  { href: "/admin", icon: RiSecurePaymentFill, text: "Admin" },
];

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";

 const filteredNavItems = navigationItems.filter(item => {
    if (item.href === "/admin") {
      return isAdmin;
    }

    if (!session && item.href !== "/") {
      return false;
    }

    return true;
  });

  return (
    <header className="fixed w-full border-b-2 border-[var(--color-s-200)] bg-white z-60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/static/franca.png"
            alt="Bandeira França"
            width={28}
            height={20}
            className="rounded-sm shadow-sm"
          />
          <span className="font-bold text-lg tracking-tight text-[var(--color-s-800)] uppercase flex items-center">
              Francês com 
              <span 
                className="relative ml-1"
                style={{ color: `var(${settings?.highlightColor || '--clara-rose'})` }}
              >
              Clara
              <span className="absolute -top-1 -right-2 text-sm inline-block rotate-35 transition-transform group-hover:rotate-[15deg]">
                {settings?.siteIcon?.startsWith("/") ? (
                  <img 
                    src={settings?.siteIcon} 
                    alt="Ícone" 
                    className="w-4 h-4 object-contain pointer-events-none" 
                  />
                ) : (
                  <span>{settings?.siteIcon || <img src="/static/flower.svg" alt="Flor" className="w-4 h-4 object-contain pointer-events-none" />}</span>
                )}
              </span>
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {filteredNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center py-1"
              >
                <div className={`flex items-center gap-2 font-medium text-sm transition-colors 
                  ${isActive ? "text-[var(--interface-accent)]" : "text-[var(--color-s-600)] group-hover:text-[var(--interface-accent)]"}`}>
                  
                  <Icon 
                    size={20} 
                    className={`transition-all duration-300 
                      ${isActive ? "text-[var(--interface-accent)]" : "text-[var(--color-s-400)] group-hover:text-[var(--interface-accent)]"}
                    `} 
                  />
                  <span>{item.text}</span>
                </div>
                
                {isActive && (
                  <div className="absolute -bottom-[22px] w-full h-1 bg-[var(--interface-accent)]" />
                )}
              </Link>
            );
          })}

          {session && (
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="ml-4 p-2 text-[var(--color-s-400)] hover:text-red-600 transition-colors cursor-pointer"
              title="Sair"
            >
              <FiLogOut size={20} />
            </button>
          )}

          {!session && (
            <Link href="/auth/login" className="font-bold text-sm text-[var(--color-s-700)] hover:text-[var(--interface-accent)] transition-colors cursor-pointer">
              Entrar
            </Link>
          )}
        </nav>

        <button className="md:hidden text-[var(--color-s-800)]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-2 shadow-lg">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 font-bold text-[var(--color-s-700)] hover:bg-[var(--color-s-50)] hover:text-[var(--interface-accent)] rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon size={20} className="text-[var(--interface-accent)]" />
              {item.text}
            </Link>
          ))}

          <div className="h-[1px] bg-[var(--color-s-100)] my-2" />

          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 p-3 font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <FiLogOut size={20} />
              Sair da conta
            </button>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center p-3 font-bold text-white bg-[var(--interface-accent)] rounded-lg"
            >
              Entrar
            </Link>
          )}
        </div>
      )}
    </header>
  );
}