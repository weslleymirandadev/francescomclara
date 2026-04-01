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

        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-[2.5rem] p-20 text-center animate-pulse font-black uppercase text-xs text-slate-400 tracking-widest shadow-2xl">
              A carregar conversas...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPosts.map((post: any) => (
                <Card
                  key={post.id}
                  className="p-6 border-none shadow-2xl hover:shadow-indigo-500/10 transition-all bg-white rounded-[2rem] group overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {post.attachmentUrl && (
                      <Link
                        href={`/forum/post/${post.id}`}
                        className="shrink-0 w-full md:w-100"
                      >
                        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-200 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                          <img
                            src={post.attachmentUrl}
                            className="w-full h-full object-cover"
                            alt={post.title}
                          />
                        </div>
                      </Link>
                    )}

                    <div className="flex-1 w-full flex flex-col min-h-40">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1 bg-slate-100 text-[9px] font-black rounded-lg uppercase tracking-widest text-slate-600 border border-slate-200">
                            {post.lesson
                              ? `Aula: ${post.lesson.title}`
                              : "Discussão Geral"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Link href={`/forum/post/${post.id}`}>
                          <h4 className="text-2xl font-black text-slate-900 group-hover:text-(--clara-rose) transition-colors mb-3 leading-tight tracking-tight">
                            {post.title}
                          </h4>
                        </Link>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          Por{" "}
                          <span className="text-slate-900 font-black underline decoration-(--clara-rose)/30">
                            {post.author?.name || "Usuário"}
                          </span>
                          <span className="opacity-60">
                            @{post.author?.username || "anonimo"}
                          </span>
                        </p>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                        {post.comments && post.comments.length > 0 && (
                          <div className="mt-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex -space-x-2">
                                {post.comments
                                  .slice(0, 3)
                                  .map((c: any, i: number) => (
                                    <div
                                      key={i}
                                      className="w-6 h-6 rounded-full border-2 border-white bg-(--clara-rose) text-[8px] flex items-center justify-center font-black text-white uppercase"
                                    >
                                      {c.author.name[0]}
                                    </div>
                                  ))}
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                Discussão em alta
                              </span>
                            </div>

                            <div className="space-y-2">
                              {post.comments.slice(0, 2).map((comment: any) => (
                                <div
                                  key={comment.id}
                                  className="flex gap-2 items-start animate-in slide-in-from-bottom-2 duration-500"
                                >
                                  <FiMessageSquare
                                    className="shrink-0 mt-1 text-(--clara-rose)/50"
                                    size={12}
                                  />
                                  <p className="text-xs text-slate-600 line-clamp-1 italic max-w-50 md:max-w-120">
                                    "{comment.content}" —{" "}
                                    <span className="font-bold text-slate-900">
                                      @{comment.author.username}
                                    </span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {filter === "mine" && (
                          <div className="flex gap-2">
                            <Link href={`/forum/meus-posts`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-slate-200 text-slate-400 hover:text-(--clara-rose)"
                              >
                                <FiEdit3 className="mr-2" /> Editar
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
