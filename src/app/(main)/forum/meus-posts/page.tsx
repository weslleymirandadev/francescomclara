"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiEdit3, FiTrash2, FiMessageSquare, FiArrowLeft, 
  FiLayers, FiCheckCircle, FiActivity 
} from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/forum/my-posts")
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Queres mesmo eliminar esta discussão? Esta ação é permanente.")) return;
    
    const res = await fetch(`/api/forum/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts.filter((p: any) => p.id !== id));
    }
  };

  const totalComments = posts.reduce((acc, post: any) => acc + (post._count?.comments || 0), 0);

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen pt-24 pb-20 bg-(--slate-50)">
      <div className="max-w-6xl mx-auto px-6">
        
        <Link href="/forum" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 hover:text-(--clara-rose) transition-colors">
          <FiArrowLeft /> VOLTAR AO FÓRUM
        </Link>

        {/* Dashboard Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-8 border-none shadow-xl bg-white rounded-[2rem] flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><FiLayers size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tópicos Criados</p>
              <h4 className="text-2xl font-black text-slate-900">{posts.length}</h4>
            </div>
          </Card>
          <Card className="p-8 border-none shadow-xl bg-white rounded-[2rem] flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-(--clara-rose) text-white flex items-center justify-center shadow-lg"><FiMessageSquare size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Respostas</p>
              <h4 className="text-2xl font-black text-slate-900">{totalComments}</h4>
            </div>
          </Card>
          <Card className="p-8 border-none shadow-xl bg-white rounded-[2rem] flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><FiActivity size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engajamento</p>
              <h4 className="text-2xl font-black text-slate-900">{posts.length > 0 ? (totalComments / posts.length).toFixed(1) : 0}</h4>
            </div>
          </Card>
        </div>

        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              A Minha <span className="text-(--clara-rose)">Atividade</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Gere as tuas contribuições para a comunidade</p>
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="py-20 text-center animate-pulse font-black text-slate-300">A CARREGAR...</div>
          ) : posts.length === 0 ? (
            <Card className="p-20 text-center border-2 border-dashed border-slate-200 bg-transparent rounded-[3rem]">
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Ainda não iniciaste nenhuma discussão.</p>
            </Card>
          ) : (
            posts.map((post: any) => (
              <Card key={post.id} className="p-8 border-none shadow-lg bg-white rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-2xl transition-all border-l-4 border-l-transparent hover:border-l-(--clara-rose)">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.lesson && (
                      <span className="text-[9px] font-black px-2 py-0.5 bg-rose-50 text-(--clara-rose) rounded uppercase tracking-tighter">
                        {post.lesson.title}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase leading-none tracking-tighter">{post.title}</h3>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <Link href={`/forum/post/${post.id}`} className="flex-1 md:flex-none">
                    <Button variant="ghost" className="w-full h-12 rounded-2xl uppercase text-[10px] font-black tracking-widest hover:bg-slate-50">
                      Visualizar
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="h-12 w-12 rounded-2xl border-slate-100 text-slate-400 hover:text-(--clara-rose)"
                    onClick={() => alert('Edição em breve!')}
                  >
                    <FiEdit3 size={18} />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 w-12 rounded-2xl border-slate-100 text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                    onClick={() => handleDelete(post.id)}
                  >
                    <FiTrash2 size={18} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}