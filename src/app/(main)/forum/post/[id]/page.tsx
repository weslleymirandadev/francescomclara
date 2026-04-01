"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiSend, FiStar } from "react-icons/fi";
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

  useEffect(() => {
    loadPost();
  }, [id]);

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

  const handleLike = async (commentId: string) => {
    if (!post) return;

    const newComments = post.comments.map((comment: any) => {
      if (comment.id === commentId) {
        const alreadyLiked = comment.likes && comment.likes.length > 0;

        return {
          ...comment,
          _count: {
            ...comment._count,
            likes: alreadyLiked
              ? Math.max(0, comment._count.likes - 1)
              : (comment._count.likes || 0) + 1,
          },
          likes: alreadyLiked ? [] : [{ userId: "current-user" }],
        };
      }
      return comment;
    });

    setPost({ ...post, comments: newComments });

    try {
      const res = await fetch(`/api/forum/comments/${commentId}/like`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Erro ao processar like");

      const data = await res.json();
    } catch (error) {
      console.error("Like falhou:", error);
      loadPost();
    }
  };

  if (loading) return <Loading />;
  if (!post)
    return <div className="pt-24 text-center">Post não encontrado.</div>;

  return (
    <main className="min-h-screen pt-24 pb-20 bg-(--slate-50)">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer"
        >
          <FiArrowLeft /> VOLTAR
        </button>

        <Card className="p-10 border-none shadow-2xl bg-white rounded-[2.5rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-(--clara-rose) text-white flex items-center justify-center text-xl font-black shadow-lg">
              {post.author?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                {post.title}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                POR <span className="text-slate-800">{post.author?.name}</span>{" "}
                • @{post.author?.name?.charAt(0) || "U"}
              </p>
            </div>
          </div>

          {post.attachmentUrl && (
            <div className="mb-8 rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
              <img
                src={post.attachmentUrl}
                alt="Post Attachment"
                className="w-full h-auto max-h-[550px] object-contain mx-auto"
              />
            </div>
          )}

          <div className="text-slate-600 text-lg leading-relaxed">
            <div className="text-slate-600 text-lg leading-relaxed">
              {post.content
                ? typeof post.content === "string"
                  ? post.content
                  : JSON.stringify(post.content).replace(/^"|"$/g, "")
                : "Sem conteúdo disponível."}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">
            Respostas ({post.comments?.length || 0})
          </h3>

          <div className="relative flex items-center group">
            <Input
              placeholder="ESCREVA SUA RESPOSTA..."
              className="h-20 pl-8 pr-24 bg-white border-none shadow-xl rounded-[2.5rem] font-bold text-sm placeholder:text-slate-300 placeholder:opacity-100"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              onClick={handleComment}
              disabled={submitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[1.8rem] p-0 flex items-center justify-center bg-slate-900 hover:bg-(--clara-rose) transition-all shadow-lg active:scale-95"
            >
              <FiSend size={22} className="text-white pr-0.5" />
            </Button>
          </div>

          <div className="space-y-4">
            {post.comments?.map((comment: any) => (
              <div
                key={comment.id}
                className="flex gap-4 items-start pl-6 group/comment"
              >
                {/* Avatar do Autor */}
                <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0 overflow-hidden border border-white shadow-sm">
                  {comment.author?.image ? (
                    <img
                      src={comment.author.image}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-(--clara-rose) text-white text-xs font-bold">
                      {comment.author?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 bg-white/80 border border-white shadow-sm rounded-[1.8rem] relative hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] font-black text-(--clara-rose) uppercase tracking-widest">
                      @{comment.author?.username || "usuário"}
                    </p>

                    <span className="text-[8px] font-bold text-slate-400 uppercase">
                      {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-700 leading-relaxed mb-4 max-w-2xl wrap-break-word">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all border ${
                        comment.likes?.length > 0
                          ? "bg-red-50 border-red-100 text-red-500 shadow-sm"
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <FiStar
                        size={16}
                        className={`${comment.likes?.length > 0 ? "fill-red-500" : ""}`}
                      />
                      <span className="text-[11px] font-black italic tracking-tighter">
                        {comment._count?.likes || 0} LIKES
                      </span>
                    </button>

                    {comment.authorId === post.authorId && (
                      <span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm">
                        OP / Autor
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
