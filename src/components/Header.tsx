"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ComponentType, useState } from "react";

import { FaRegClone } from "react-icons/fa";
import { FiUser as User } from "react-icons/fi";
import { HiOutlineCog } from "react-icons/hi";
import { BiDirections } from "react-icons/bi";
import { HiMenu, HiX } from "react-icons/hi";

interface NavigationItem {
  href: string;
  icon: ComponentType<{ className?: string }>;
  text: string;
  ariaLabel: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: "/perfil",
    icon: User,
    text: "Perfil",
    ariaLabel: "Ir para Perfil",
  },
  {
    href: "/flashcards",
    icon: FaRegClone,
    text: "Flashcards",
    ariaLabel: "Ir para Flashcards",
  },
  {
    href: "/minha-trilha",
    icon: BiDirections,
    text: "Minha Trilha",
    ariaLabel: "Ir para Minha Trilha",
  },
  {
    href: "/configuracoes",
    icon: HiOutlineCog,
    text: "Configurações",
    ariaLabel: "Ir para Configurações",
  },
];

interface NavItemProps {
  item: NavigationItem;
  isActive: boolean;
  isMobile?: boolean;
  onMobileClick?: () => void;
}

function NavItem({ item, isActive, isMobile = false, onMobileClick }: NavItemProps) {
  const Icon = item.icon;
  const iconSize = item.href === "/flashcards" ? "w-4 h-4" : "w-5 h-5";
  const isPerfil = item.href === "/perfil";

  // Largura mínima menor para o botão de perfil
  // Em telas grandes (com labels): largura normal
  // Em telas menores (só ícones): largura reduzida
  const minWidthClass = isPerfil
    ? "lg:min-w-[60px] min-w-[40px]"
    : "lg:min-w-[122px] min-w-[40px]";

  if (isMobile) {
    return (
      <li>
        <Link
          href={item.href}
          onClick={onMobileClick}
          className={`
            flex items-center gap-3
            font-medium text-sm
            px-4 py-3
            w-full
            border-b border-gunmetal/20
            transition-colors duration-50
            ${isActive
              ? "bg-gunmetal/10 text-gunmetal"
              : "hover:bg-gunmetal/5"
            }
          `}
          aria-label={item.ariaLabel}
          aria-current={isActive ? "page" : undefined}
        >
          <Icon className={iconSize} aria-hidden="true" />
          <span>{item.text}</span>
        </Link>
      </li>
    );
  }

  return (
    <li className={`relative flex items-center group h-8 ${minWidthClass} justify-center`}>
      {/* Shadow effect on hover */}
      <div
        className="pointer-events-none absolute left-0 top-0 w-full h-full bg-gunmetal translate-x-2 translate-y-2 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
        aria-hidden="true"
      />
      <Link
        href={item.href}
        className={`
          relative z-10 flex items-center justify-center gap-2
          font-medium text-sm
          ${isPerfil ? "px-2" : "px-3"} py-1.5
          w-full h-full
          bg-light-coral
          border transition-all duration-50
          box-border
          ${isActive
            ? "border-gunmetal -translate-y-0.5"
            : "border-transparent hover:border-gunmetal hover:-translate-y-0.5"
          }
        `}
        aria-label={item.ariaLabel}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className={iconSize} aria-hidden="true" />
        {/* Labels aparecem apenas em telas grandes (lg e acima) */}
        <span className="text-nowrap lg:inline hidden">{item.text}</span>
      </Link>
    </li>
  );
}

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed w-full border-b-4 border-gunmetal text-gunmetal bg-light-coral backdrop-blur z-50 py-3">
      <div className="mx-auto flex items-center justify-between px-4">
        <div className="relative flex items-center group h-8 justify-center">
          <div
            className="pointer-events-none absolute left-0 top-0 w-full h-full bg-gunmetal translate-x-2 translate-y-2 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
            aria-hidden="true"
          />
          <Link
            href="/"
            className="relative z-10 flex items-center justify-center gap-2 font-medium px-3 py-1.5 w-full h-full bg-light-coral hover:border transition-all duration-50 box-border hover:border-gunmetal hover:-translate-y-0.5"
            aria-label="Ir para a página inicial"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <h1 className="flex items-center p-2 gap-2 bg-clip-text text-secondary tracking-tight">
              <Image
                src="/static/frança.png"
                alt="Francês com Cara"
                width={35}
                height={35}
                priority
                className="max-[550px]:w-[30px] max-[550px]:h-[30px]"
              />
              <span className="text-nowrap max-[890px]:text-sm max-[550px]:text-[20px] max-[400px]:text-[17px]">FRANCÊS COM CLARA</span>
            </h1>
          </Link>
        </div>

        {/* Desktop/Tablet Navigation - mostra ícones sempre, labels só em telas grandes */}
        <nav
          aria-label="Menu principal"
          className="hidden sm:flex min-h-[32px] max-h-[32px]"
        >
          <ul className="flex lg:space-x-2 space-x-1 m-0 p-0 list-none">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                />
              );
            })}
          </ul>
        </nav>

        {/* Mobile Menu Button - apenas em telas muito pequenas (< 640px) */}
        <button
          onClick={toggleMobileMenu}
          className="sm:hidden flex items-center justify-center w-10 h-10 text-gunmetal hover:bg-gunmetal/10 rounded transition-colors"
          aria-label="Abrir menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <HiX className="w-6 h-6" />
          ) : (
            <HiMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {
        isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 z-40 sm:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Mobile Menu */}
            <nav
              aria-label="Menu principal mobile"
              className="fixed top-[73px] left-0 right-0 bg-light-coral border-b-4 border-gunmetal z-50 sm:hidden shadow-lg"
            >
              <ul className="m-0 p-0 list-none">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <NavItem
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      isMobile={true}
                      onMobileClick={closeMobileMenu}
                    />
                  );
                })}
              </ul>
            </nav>
          </>
        )
      }
    </header >
  );
}

