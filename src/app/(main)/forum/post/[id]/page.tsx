"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadPost() {
    try {
      const res = await fetch(`/api/forum/posts/${id}`);
      if (!res.ok) throw new Error("Erro ao buscar");
      const data = await res.json();
      setPost(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPost(); }, [id]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/forum/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment("");
      loadPost();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!post) return <div className="pt-24 text-center">Post não encontrado.</div>;

  return (
    <main className="min-h-screen pt-24 pb-20 bg-(--slate-50)">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <FiArrowLeft /> VOLTAR
        </button>

        <Card className="p-10 border-none shadow-2xl bg-white rounded-[2.5rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-(--clara-rose) text-white flex items-center justify-center text-xl font-black shadow-lg">
              {post.author?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{post.title}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                POR <span className="text-slate-800">{post.author?.name}</span> • @{post.author?.name?.charAt(0) || "U"}
              </p>
            </div>
          </div>
          
          <div className="text-slate-600 text-lg leading-relaxed">
            <div className="text-slate-600 text-lg leading-relaxed">
            {post.content 
                ? (typeof post.content === 'string' 
                    ? post.content 
                    : JSON.stringify(post.content).replace(/^"|"$/g, '')) 
                : "Sem conteúdo disponível."}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Respostas ({post.comments?.length || 0})</h3>
          
          <div className="relative group">
            <Input 
              placeholder="ESCREVA SUA RESPOSTA..."
              className="h-20 pl-8 pr-20 bg-white border-none shadow-xl rounded-[2rem] font-bold text-sm"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button 
              onClick={handleComment}
              disabled={submitting}
              className="absolute right-3 top-3 bottom-3 w-14 rounded-[1.5rem] p-0"
            >
              <FiSend size={20} />
            </Button>
          </div>

          <div className="space-y-4">
            {post.comments?.map((comment: any) => (
              <div key={comment.id} className="flex gap-4 items-start pl-6">
                <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0 overflow-hidden border border-white shadow-sm">
                  {comment.author?.image ? (
                    <img 
                      src={comment.author.image} 
                      alt={comment.author.name || "Avatar"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-(--clara-rose) text-white text-xs font-bold">
                      {comment.author?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 bg-white/80 border border-white shadow-sm rounded-[1.8rem] relative">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] font-black text-(--clara-rose) uppercase tracking-widest">
                      @{comment.author?.username || "usuário"}
                    </p>
                    
                    <span className="text-[8px] font-bold text-slate-400 uppercase">
                      {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}