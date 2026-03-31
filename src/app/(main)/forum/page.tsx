"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FiPlus,
  FiMessageSquare,
  FiSearch,
  FiStar,
  FiBookOpen,
  FiUsers,
  FiChevronRight,
  FiFilter,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ForumPost } from "@prisma/client";
import { Loading } from "@/components/ui/loading";

export default function ForumPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [content, setContent] = useState<{ tracks: any[] }>({ tracks: [] });
  const { data: session, update } = useSession();

  useEffect(() => {
    fetch("/api/public/content")
      .then((res) => res.json())
      .then((data) => setContent(data));
  }, []);

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

  const filteredPosts = posts.filter((post) => {
    if (filter === "mine") return post.authorId === session?.user?.id;
    return true;
  });

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen md:pt-24 pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto md:px-6 space-y-10">
        <section className="relative overflow-hidden md:rounded-[3rem] bg-slate-900 text-white shadow-2xl min-h-[350px] flex items-center">
          {content.tracks.length > 0 && (
            <div className="absolute inset-0 w-full h-full">
              <img
                src={
                  content.tracks[0].imageUrl ||
                  content.tracks[0].objective?.imageUrl
                }
                className="w-full h-full object-cover opacity-40"
                alt="Banner"
              />
              <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/60 to-transparent" />
            </div>
          )}

          <div className="relative z-10 p-12 max-w-2xl">
            <span className="text-(--clara-rose) font-black uppercase tracking-[0.3em] text-[10px]">
              Explorar Conteúdo
            </span>
            <h2 className="text-5xl font-black uppercase tracking-tighter mt-2 leading-none">
              {content.tracks[0]?.objective?.name || "Comunidade Clara"}
            </h2>
            <p className="mt-4 text-slate-300 font-medium text-lg">
              Tire suas dúvidas sobre {content.tracks[0]?.name} e interaja com
              outros alunos.
            </p>
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative group w-full md:flex-1 px-3 md:px-0">
            <Input
              placeholder="Pesquisar por título, aula ou @username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-16 pl-14 bg-white border-none shadow-sm rounded-2xl focus-visible:ring-1 focus-visible:ring-(--clara-rose)"
            />
            <FiSearch
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-(--clara-rose) transition-colors"
              size={20}
            />
          </div>

          <div className="flex items-center justify-center gap-3 w-full md:w-auto">
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
                <FiPlus
                  className="mr-2 group-hover:rotate-90 transition-transform"
                  size={20}
                />
                Criar Tópico
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden bg-white rounded-md md:rounded-[2.5rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[55%]">Discussão</TableHead>
                <TableHead>Categoria / Aula</TableHead>
                <TableHead className="text-center">Respostas</TableHead>
                <TableHead className="text-right md:px-10">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-20 animate-pulse font-black uppercase text-xs text-slate-400 tracking-widest"
                  >
                    A carregar conversas...
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post: any) => (
                  <TableRow
                    key={post.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="py-6 pl-10">
                      <Link href={`/forum/post/${post.id}`}>
                        {post.attachmentUrl && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-200 shrink-0">
                            <img
                              src={post.attachmentUrl}
                              className="w-full h-full object-cover"
                              alt="Anexo"
                            />
                          </div>
                        )}

                        <h4 className="text-base font-bold text-slate-900 group-hover:text-(--clara-rose) transition-colors mb-1">
                          {post.title}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Por{" "}
                          <span className="text-slate-700 font-black">
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
                        <span className="text-sm">
                          {post._count?.comments || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      {filter === "mine" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-(--clara-rose)"
                          >
                            <FiEdit3 size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => post.id}
                          >
                            <FiTrash2 size={16} />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </main>
  );
}
