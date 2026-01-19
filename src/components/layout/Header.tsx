"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

import { FaRegClone } from "react-icons/fa";
import { FiUser as User, FiLogOut, FiMessageSquare, FiLayout, FiChevronDown } from "react-icons/fi";
import { HiOutlineCog, HiMenu, HiX } from "react-icons/hi";
import { RiSecurePaymentFill } from "react-icons/ri";
import { BiDirections } from "react-icons/bi";

interface HeaderProps {
  settings?: {
    siteIcon: string;
    highlightColor: string;
  }
}

// Apenas o que é essencial para o estudo direto
const mainNavigation = [
  { href: "/dashboard", icon: FiLayout, text: "Dashboard" },
  { href: "/forum", icon: FiMessageSquare, text: "Fórum" },
  { href: "/minha-trilha", icon: BiDirections, text: "Trilha" },
  { href: "/flashcards", icon: FaRegClone, text: "Flashcards" },
];

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="fixed w-full border-b-2 border-[var(--color-s-200)] bg-white z-[100]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        {/* LOGO */}
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
                  <img src={settings?.siteIcon} alt="Icon" className="w-4 h-4 object-contain" />
                ) : (
                  <span>{settings?.siteIcon || "🌸"}</span>
                )}
              </span>
            </span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8">
          {session && mainNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-center gap-2 py-1 transition-all"
              >
                <Icon 
                  size={18} 
                  className={isActive ? "text-[var(--interface-accent)]" : "text-[var(--color-s-400)] group-hover:text-[var(--interface-accent)]"} 
                />
                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors
                  ${isActive ? "text-[var(--interface-accent)]" : "text-[var(--color-s-600)] group-hover:text-[var(--interface-accent)]"}`}>
                  {item.text}
                </span>
                
                {isActive && (
                  <div className="absolute -bottom-[22px] left-0 right-0 h-1 bg-[var(--interface-accent)] rounded-t-full" />
                )}
              </Link>
            );
          })}

          {!session && (
            <Link href="/auth/login" className="font-black text-[11px] uppercase tracking-widest text-[var(--color-s-700)] hover:text-[var(--interface-accent)]">
              Entrar
            </Link>
          )}

          {/* USER DROPDOWN */}
          {session && (
            <div className="relative group ml-4">
              <button className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-s-100)] border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-slate-400" />
                  )}
                </div>
                <FiChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform" />
              </button>

              {/* DROPDOWN MENU */}
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-2xl rounded-[1.5rem] p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-slate-100 z-50">
                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conta</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{session.user?.email}</p>
                </div>

                <Link href="/perfil" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl">
                  <User size={16} /> <span className="text-sm">Editar Perfil</span>
                </Link>
                
                <Link href="/configuracoes" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl">
                  <HiOutlineCog size={16} /> <span className="text-sm">Conta e Segurança</span>
                </Link>
                
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                    <RiSecurePaymentFill size={16} /> Painel Admin
                  </Link>
                )}

                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all mt-1"
                >
                  <FiLogOut size={16} /> Sair da conta
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-[var(--color-s-800)]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-6 space-y-3 shadow-2xl animate-in slide-in-from-top duration-300">
          {session && mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 font-black text-[11px] uppercase tracking-widest text-[var(--color-s-700)] hover:bg-[var(--color-s-50)] hover:text-[var(--interface-accent)] rounded-2xl transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon size={20} className="text-[var(--interface-accent)]" />
              {item.text}
            </Link>
          ))}
          
          <div className="h-[1px] bg-slate-100 my-4" />
          
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-4 p-4 font-black text-[11px] uppercase tracking-widest text-red-500 bg-red-50/50 rounded-2xl"
            >
              <FiLogOut size={20} /> Sair da conta
            </button>
          ) : (
            <Link href="/auth/login" className="flex items-center justify-center p-4 font-black text-[11px] uppercase tracking-widest text-white bg-[var(--interface-accent)] rounded-2xl">
              Entrar
            </Link>
          )}
        </div>
      )}
    </header>
  );
}