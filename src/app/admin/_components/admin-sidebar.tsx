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
  { name: 'Cursos', href: '/admin/courses', icon: BookOpen },
  { name: 'Usuários', href: '/admin/users', icon: Users },
  { name: 'Relatórios', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex items-center shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="flex flex-col grow mt-5">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 shrink-0 ${
                      isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
