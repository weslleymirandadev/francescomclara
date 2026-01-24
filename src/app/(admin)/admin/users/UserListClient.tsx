"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { FiSearch, FiArrowRight } from "react-icons/fi"
import { LuUserCheck, LuUsers } from "react-icons/lu"
import { Loading } from '@/components/ui/loading'
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string | null
  email: string | null
  plan: string
  status: string
  date: string
  role: "USER" | "MODERATOR" | "ADMIN"
}

export default function UserListClient({ users = [] }: { users: User[] }) {
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFocusSearch = () => {
    inputRef.current?.focus();
  };

  const rolePriority = {
    ADMIN: 1,
    MODERATOR: 2,
    USER: 3,
  };

  const filteredUsers = users
    .filter((user) => {
      const name = user.name ?? "";
      const email = user.email ?? "";
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (rolePriority[a.role] !== rolePriority[b.role]) {
        return rolePriority[a.role] - rolePriority[b.role];
      }
      return (a.name ?? "").localeCompare(b.name ?? "");
    });

  const handleUpdateRole = async (userId: string, newRole: "USER" | "MODERATOR" | "ADMIN") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        toast.success("Cargo atualizado!");
        router.refresh();
      } else {
        toast.error("Erro ao salvar no servidor.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="p-4 md:p-10 max-w-6xl mx-auto w-full space-y-8">
        
        <header className="space-y-4 border-b border-slate-50 pb-6">
          <div>
            <h1 className="flex gap-1 text-4xl md:text-5xl font-bold font-frenchpress text-(--interface-accent) uppercase tracking-tighter">
              Étudiants 
              <img src="/static/flower.svg" alt="Flor" className="w-8 h-8 object-contain pointer-events-none" />
            </h1>
            <p className="text-slate-400 text-[11px] md:text-sm font-medium italic mt-1">
              Gestão da base oficial de alunos
            </p>
          </div>

          <div className="flex gap-2 w-full md:max-w-md">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder="Procurar aluno..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-50 border-none focus:ring-1 focus:ring-text-(--interface-accent) rounded-xl h-12 text-sm"
              />
            </div>
            
            <button 
              type="button"
              onClick={handleFocusSearch}
              className="bg-slate-900 text-white h-12 w-12 flex items-center justify-center rounded-xl shrink-0 shadow-lg hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
            >
              <FiSearch size={20} />
            </button>
          </div>
        </header>

        {/* Grid: 1 coluna no mobile, 2 no PC (deitados) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 md:p-8 rounded-[2rem] border border-slate-100 bg-white shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0">
              <LuUsers size={28} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total de Alunos</p>
              <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{users.length}</div>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-[2rem] border border-slate-100 bg-white shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
              <LuUserCheck size={28} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Alunos Ativos</p>
              <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">
                {users.filter(u => u.status === 'Ativo').length}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.3em] px-2">Liste d&apos;élèves</h3>
          
          <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-5 md:p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shrink-0">
                      {(user.name ?? "??").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-800 text-sm md:text-base truncate leading-tight">
                        {user.name ?? "Sem Nome"}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate mt-1">
                        {user.email ?? "Sem Email"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                      className={`
                        px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border-none cursor-pointer transition-all
                        ${user.role === 'ADMIN' ? 'bg-rose-500 text-white' : 
                          user.role === 'MODERATOR' ? 'bg-amber-400 text-black' : 
                          'bg-slate-100 text-slate-600'}
                      `}
                    >
                      <option value="USER">Usuário</option>
                      <option value="MODERATOR">Moderador</option>
                      <option value="ADMIN">Admin</option>
                    </select>

                    <span className="hidden sm:inline-block px-3 py-1 rounded-lg bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest">
                      {user.plan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}