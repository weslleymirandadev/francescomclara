"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiSend,
  FiStar,
  FiAlertTriangle,
  FiTrash2,
  FiEdit3,
  FiX,
  FiImage,
  FiVideo,
} from "react-icons/fi";
import UserProfileModal from "@/components/forum/UserProfileModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { toast } from "react-hot-toast";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [previews, setPreviews] = useState<
    { url: string; type: string; id?: string }[]
  >([]);
  const [files, setFiles] = useState<File[]>([]);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const removeAttachment = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (post) {
      setEditTitle(post.title);

      const contentText =
        typeof post.content === "object" && post.content !== null
          ? (post.content as any).text
          : post.content;

      setEditContent(contentText || "");

      if (post.attachments) {
        setPreviews(
          post.attachments.map((at: any) => ({
            id: at.id,
            url: at.url,
            type: at.type,
          })),
        );
      }
    }
  }, [post]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);

    setFiles((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

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

  const handleLike = async (postId: string) => {
    if (!session?.user?.id) return toast.error("Faça login para curtir");

    const previousPost = { ...post };
    const isCurrentlyLiked = post.postLikes?.some(
      (l: any) => l.userId === session.user.id,
    );

    setPost((prev: any) => ({
      ...prev,
      postLikes: isCurrentlyLiked
        ? prev.postLikes.filter((l: any) => l.userId !== session.user.id)
        : [...(prev.postLikes || []), { userId: session.user.id }],
      _count: {
        ...prev._count,
        postLikes: isCurrentlyLiked
          ? Math.max(0, (prev._count?.postLikes || 0) - 1)
          : (prev._count?.postLikes || 0) + 1,
      },
    }));

    try {
      const res = await fetch(`/api/forum/posts/${postId}/like`, {
        method: "POST",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
    } catch (error) {
      setPost(previousPost);
      toast.error("Erro ao processar curtida");
    }
  };

  const handleLikeComment = async (commentId: string) => {
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

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Tem certeza que deseja excluir seu comentário?")) return;

    try {
      const res = await fetch(`/api/forum/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Comentário removido!");
        loadPost();
      } else {
        toast.error("Erro ao excluir.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    }
  };

  const handleReportComment = async (commentId: string) => {
    const reason = prompt("Qual o motivo da denúncia? (Spam, Ofensa, etc)");
    if (!reason) return;

    try {
      const res = await fetch(`/api/forum/comments/${commentId}/reports`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        toast.success("Denúncia enviada aos moderadores.");
      } else {
        toast.error("Erro ao enviar denúncia.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    }
  };

  const handleUpdatePost = async () => {
    setLoading(true);
    try {
      const finalAttachments = [];

      const existingOnes = previews
        .filter((p) => p.id)
        .map((p) => ({
          url: p.url,
          type: p.type,
        }));
      finalAttachments.push(...existingOnes);

      const uploadPromises = files.map(async (f) => {
        const formData = new FormData();
        formData.append("file", f);
        const res = await fetch("/api/forum/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          return {
            url: data.url,
            type: f.type.startsWith("video/") ? "VIDEO" : "IMAGE",
          };
        }
        return null;
      });

      const uploadedResults = (await Promise.all(uploadPromises)).filter(
        Boolean,
      );
      finalAttachments.push(...uploadedResults);

      const response = await fetch(`/api/forum/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: { text: editContent },
          attachments: finalAttachments,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      toast.success("Post atualizado!");
      setIsEditing(false);
      setFiles([]);
      loadPost();
    } catch (err) {
      toast.error("Erro ao salvar alterações");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/forum/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Post excluído!");
        router.push("/forum");
      } else {
        toast.error("Erro ao excluir.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReportPost = async () => {
    const reason = window.prompt("Por que você deseja denunciar este post?");
    if (!reason) return;

    const loadingToast = toast.loading("Enviando denúncia...");

    try {
      const res = await fetch(`/api/forum/posts/${post.id}/reports`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error();

      toast.success("Obrigado! A moderação foi notificada.", {
        id: loadingToast,
      });
    } catch (error) {
      toast.error("Erro ao enviar denúncia.", { id: loadingToast });
    }
  };

  if (loading || !post) return <Loading />;

  const isLiked = post.postLikes?.some(
    (l: any) => l.userId === session?.user?.id,
  );

  return (
    <main className="min-h-screen pt-24 pb-20 bg-(--slate-50)">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
          >
            <FiArrowLeft size={24} />
          </button>

          {session?.user?.id !== post.authorId && (
            <button
              onClick={handleReportPost}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-50 border border-orange-100 text-orange-500 hover:bg-orange-100 transition-all shadow-sm text-[11px] font-black italic tracking-tighter uppercase cursor-pointer"
            >
              <FiAlertTriangle size={18} />
              Denunciar Post
            </button>
          )}
        </div>

        <Card className="p-10 border-none shadow-2xl bg-white rounded-[2.5rem]">
          <div className="flex items-center gap-4 mb-8">
            <div
              onClick={() => setViewingUser(post.author)}
              className="w-14 h-14 cursor-pointer rounded-2xl bg-(--clara-rose) text-white flex items-center justify-center text-xl font-black shadow-lg overflow-hidden"
            >
              {post.author?.image ? (
                <img
                  src={post.author.image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                post.author?.name?.charAt(0) || "U"
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                    Título do Post
                  </label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-14 bg-slate-50 border-none rounded-2xl text-xl font-black uppercase focus:ring-2 focus:ring-(--clara-rose)"
                  />
                </div>
              ) : (
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter wrap-break-word max-w-2xl">
                  {post.title}
                  </h1>
                  {post.author?.role === "ADMIN" && (
                        <span className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                          ADMIN
                        </span>
                      )}
              )}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                POR <span className="text-slate-800">{post.author?.name}</span>{" "}
                •{" "}
                <span className="text-[8px]">
                  @{post.author?.username || "usuário"}
                </span>
              </p>
            </div>
          </div>

          <div className="mb-8">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previews.map((p, index) => (
                    <div
                      key={index}
                      className="relative rounded-[2rem] overflow-hidden border-2 border-(--clara-rose) shadow-inner bg-slate-50 group"
                    >
                      {p.type === "VIDEO" ? (
                        <video
                          src={p.url}
                          className="w-full h-48 object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={p.url}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute top-2 right-2 bg-white/90 p-2 rounded-full hover:bg-white shadow-md transition-colors"
                      >
                        <FiX className="text-red-500" size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 px-6 h-12 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600">
                    <FiImage size={18} /> Adicionar Imagem
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <label className="flex items-center gap-2 px-6 h-12 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600">
                    <FiVideo size={18} /> Adicionar Vídeo
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {post.attachments?.map((at: any) => (
                  <div
                    key={at.id}
                    className="rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-inner"
                  >
                    {at.type === "VIDEO" ? (
                      <video
                        src={at.url}
                        className="w-full h-auto max-h-[550px]"
                        controls
                      />
                    ) : (
                      <img
                        src={at.url}
                        alt="Anexo"
                        className="w-full h-auto max-h-[550px] object-contain mx-auto"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-slate-600 text-lg leading-relaxed">
            {isEditing ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Mensagem
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[250px] bg-slate-50 border-none rounded-[2rem] p-8 text-base font-medium outline-none focus:ring-2 focus:ring-(--clara-rose) transition-all"
                />
              </div>
            ) : (
              <div className="whitespace-pre-wrap wrap-break-word max-w-3xl">
                {typeof post.content === "object" && post.content !== null
                  ? (post.content as any).text
                  : post.content}
              </div>
            )}
          </div>

          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLike(post.id);
              }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 active:scale-90 cursor-pointer
                ${
                  post.postLikes?.some(
                    (l: any) => l.userId === session?.user?.id,
                  )
                    ? "bg-rose-100 text-(--clara-rose) shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }
              `}
            >
              <FiStar
                className={`
                  transition-transform duration-300
                  ${
                    post.postLikes?.some(
                      (l: any) => l.userId === session?.user?.id,
                    )
                      ? "fill-current scale-125 rotate-72"
                      : "scale-100 rotate-0"
                  }
                `}
                size={18}
              />
              <span className="font-bold text-sm">
                {post._count?.postLikes || 0}
              </span>
            </button>
          </div>

          {session?.user?.id === post.authorId && (
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleUpdatePost}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8 rounded-2xl text-[11px] font-black tracking-widest uppercase shadow-lg shadow-green-200"
                  >
                    {submitting ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setFiles([]);
                    }}
                    className="h-12 px-8 text-[11px] font-black tracking-widest uppercase"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 h-12 px-8 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-black tracking-widest uppercase"
                  >
                    <FiEdit3 size={16} /> Editar Post
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-500 hover:bg-red-50 h-12 px-8 text-[11px] font-black tracking-widest uppercase gap-2"
                  >
                    <FiTrash2 size={16} /> Excluir
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">
            Respostas ({post.comments?.length || 0})
          </h3>

          <div className="relative flex items-center group">
            <Input
              placeholder="ESCREVA SUA RESPOSTA..."
              className="h-20 pl-8 pr-24 bg-white border-none shadow-xl rounded-[2.5rem] font-bold text-sm placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-(--clara-rose)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              onClick={handleComment}
              disabled={submitting || !newComment.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[1.8rem] p-0 flex items-center justify-center bg-slate-900 hover:bg-(--clara-rose) transition-all shadow-lg active:scale-95"
            >
              <FiSend size={22} className="text-white pr-0.5" />
            </Button>
          </div>

          <div className="space-y-4">
            {post.comments?.map((comment: any) => (
              <div
                key={comment.id}
                className="group/comment relative bg-white border border-slate-100 rounded-[2.5rem] p-2 transition-all hover:shadow-xl hover:shadow-slate-200/50 flex gap-4 items-start"
              >
                <div className="flex-1 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      onClick={() => setViewingUser(comment.author)}
                      className="w-10 h-10 cursor-pointer rounded-xl bg-slate-100 overflow-hidden border border-white shadow-sm"
                    >
                      {comment.author?.image ? (
                        <img
                          src={comment.author.image}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold text-xs uppercase">
                          {comment.author?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-(--clara-rose) uppercase tracking-widest">
                        @{comment.author?.username || "usuário"}
                      </p>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-700 leading-relaxed mb-6 wrap-break-word max-w-3xl">
                    {typeof comment.content === "object" &&
                    comment.content !== null
                      ? (comment.content as any).text
                      : comment.content}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all border cursor-pointer ${
                        comment.likes?.some(
                          (l: any) => l.userId === session?.user?.id,
                        )
                          ? "bg-red-50 border-red-100 text-red-500 shadow-sm"
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <FiStar
                        size={16}
                        className={
                          comment.likes?.length > 0 ? "fill-current" : ""
                        }
                      />
                      <span className="text-[11px] font-black italic tracking-tighter">
                        {comment._count?.likes || 0} LIKES
                      </span>
                    </button>

                    {session?.user?.id === comment.authorId ? (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition-all shadow-sm text-[11px] font-black italic tracking-tighter uppercase cursor-pointer"
                      >
                        <FiTrash2 size={16} /> Excluir
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReportComment(comment.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-50 border border-orange-100 text-orange-500 hover:bg-orange-100 transition-all shadow-sm text-[11px] font-black italic tracking-tighter uppercase cursor-pointer"
                      >
                        <FiAlertTriangle size={16} /> Denunciar
                      </button>
                    )}

                    {comment.authorId === post.authorId && (
                      <span className="text-[9px] font-black bg-slate-900 text-white px-4 py-2 rounded-xl uppercase tracking-tighter shadow-md">
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

      {viewingUser && (
        <UserProfileModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
    </main>
  );
}
