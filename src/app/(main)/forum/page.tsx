"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  FiPlus, FiMessageSquare, FiSearch, FiStar, 
  FiBookOpen, FiUsers, FiChevronRight, FiFilter 
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { ForumPost } from "@prisma/client";
import { Loading } from "@/components/ui/loading";

export default function ForumPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const { data: session, update } = useSession();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/forum/posts?search=${search}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Erro ao carregar fórum");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchPosts, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const [filter, setFilter] = useState("all");

  const filteredPosts = posts.filter(post => {
    if (filter === "mine") return post.authorId === session?.user?.id;
    return true;
  });

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen pt-24 pb-20 bg-(--slate-50) animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl min-h-[350px] flex items-center">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1500')] bg-cover bg-center" />
          <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row justify-between items-center gap-10 w-full">
            <div className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-(--clara-rose) rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                <FiStar className="animate-pulse" /> Novidade na Trilha
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                L'art de la <br /> <span className="text-(--clara-rose)">Gastronomie</span>
              </h2>
              <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-md">
                Explora as novas aulas sobre vocabulário de culinária e etiqueta francesa. Já disponíveis na tua trilha de aprendizagem!
              </p>
              <Button variant="accent" size="lg" className="rounded-2xl px-8 shadow-xl uppercase text-[11px] font-black tracking-widest cursor-pointer">
                Ver Novas Aulas <FiChevronRight className="ml-2" />
              </Button>
            </div>

            <Card className="hidden lg:block w-80 bg-white/5 backdrop-blur-xl border-white/10 p-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-(--clara-rose) mb-6">A Nossa Comunidade</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><FiUsers /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Interação</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Ajuda mútua entre alunos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><FiBookOpen /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Conteúdo</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Dúvidas das trilhas</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative group w-full md:flex-1">
            <Input 
              placeholder="Pesquisar por título, aula ou @username..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-16 pl-14 bg-white border-none shadow-sm rounded-2xl focus-visible:ring-1 focus-visible:ring-(--clara-rose)"
            />
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-(--clara-rose) transition-colors" size={20} />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
              <button 
                onClick={() => setFilter("all")}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  filter === "all" 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilter("mine")}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  filter === "mine" 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Meus
              </button>
            </div>

            <Link href="/forum/novo" className="shrink-0">
              <Button className="h-16 px-8 rounded-2xl shadow-xl shadow-(--clara-rose)/10 bg-slate-900 hover:bg-(--clara-rose) text-white uppercase text-[11px] font-black tracking-widest transition-all cursor-pointer group">
                <FiPlus className="mr-2 group-hover:rotate-90 transition-transform" size={20} /> 
                Criar Tópico
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden bg-white rounded-[2.5rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[55%]">Discussão</TableHead>
                <TableHead>Categoria / Aula</TableHead>
                <TableHead className="text-center">Respostas</TableHead>
                <TableHead className="text-right px-10">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20 animate-pulse font-black uppercase text-xs text-slate-400 tracking-widest">A carregar conversas...</TableCell></TableRow>
              ) : posts.map((post: any) => (
                <TableRow key={post.id} className="group hover:bg-slate-50 transition-colors">
                  <TableCell className="py-6 pl-10">
                    <Link href={`/forum/post/${post.id}`}>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-(--clara-rose) transition-colors mb-1">
                        {post.title}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Por <span className="text-slate-700 font-black">
                          {post.author?.name || "Usuário"} 
                        </span> 
                        <span className="ml-2 text-(--clara-rose)">
                          @{post.author?.username || "anonimo"}
                        </span>
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-[9px] font-black rounded-lg uppercase tracking-widest text-slate-600 border border-slate-200 w-fit">
                        {post.lesson ? `Aula: ${post.lesson.title}` : "Geral"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-bold">
                      <FiMessageSquare size={16} />
                      <span className="text-sm">{post._count?.comments || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </main>
  );
}