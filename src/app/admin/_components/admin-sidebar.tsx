"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome as Home,
  FaBookOpen as BookOpen,
  FaCog as Settings,
  FaUsers as Users,
  FaChartBar as BarChart2
} from 'react-icons/fa';

const navigation = [
  { name: 'Visão Geral', href: '/admin', icon: Home },
  { name: 'Conteúdo', href: '/admin/content', icon: BookOpen },
  { name: 'Usuários', href: '/admin/users', icon: Users },
  { name: 'Relatórios', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex w-[280px] md:flex-col">
      <div className="flex flex-col grow pt-5 overflow-y-auto bg-white border-r-2 border-[var(--color-s-200)]">
        <div className="flex items-center gap-2 px-6 mb-10">
          <h1 className="text-lg font-bold text-[var(--interface-accent)] tracking-wider uppercase">
            Admin
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-[var(--interface-accent)] text-white shadow-md' 
                    : 'text-[var(--color-s-600)] hover:bg-[var(--color-s-50)] hover:text-[var(--interface-accent)]'}
                `}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-[var(--interface-accent)]'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}