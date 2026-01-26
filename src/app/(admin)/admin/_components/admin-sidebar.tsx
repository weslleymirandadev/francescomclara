"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome as Home,
  FaBookOpen as BookOpen,
  FaCog as Settings,
  FaUsers as Users,
  FaChartBar as BarChart2,
  FaDollarSign as DollarSign
} from 'react-icons/fa';

const navigation = [
  { name: 'Geral', shortName: 'Geral', href: '/admin', icon: Home },
  { name: 'Conteúdo', shortName: 'Conteúdo', href: '/admin/content', icon: BookOpen },
  { name: 'Usuários', shortName: 'Users', href: '/admin/users', icon: Users },
  { name: 'Planos', shortName: 'Planos', href: '/admin/subscriptions', icon: DollarSign },
  { name: 'Relatórios', shortName: 'Relatos', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Ajustes', shortName: 'Ajustes', href: '/admin/settings', icon: Settings }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex w-[280px] flex-col sticky top-[70px] h-[calc(100vh-70px)] bg-white border-r-2 border-(--color-s-200) animate-in fade-in duration-700">
        <div className="flex items-center gap-2 px-6 py-8">
          <h1 className="text-lg font-bold text-interface-accent tracking-wider uppercase">
            Admin Panel
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
                    ? 'bg-interface-accent text-white shadow-md' 
                    : 'text-s-600 hover:bg-s-50 hover:text-interface-accent'}
                `}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-interface-accent'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-(--color-s-200) flex justify-around items-center px-2 py-3 z-100 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 gap-1 transition-colors ${
                isActive ? 'text-interface-accent' : 'text-s-400'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center px-1">
                {item.shortName}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-interface-accent rounded-b-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}