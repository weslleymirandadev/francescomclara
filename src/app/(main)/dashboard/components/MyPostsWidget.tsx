import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { FiMessageSquare, FiImage, FiStar } from "react-icons/fi";
import { ArrowRight } from "lucide-react";

export function MyPostsWidget() {
  const { data: session, status } = useSession();
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/user/me");

        if (!res.ok) return;

        const data = await res.json();

        if (data.posts && Array.isArray(data.posts)) {
          setMyPosts(data.posts);
        }
      } catch (error) {
        console.error("Erro ao carregar posts do widget:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status]);

  if (loading) return <Loading />;

  if (myPosts.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-black text-lg mb-4 italic uppercase tracking-tighter">
          Minhas Interações
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Nenhuma interação recente.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-black text-xl italic uppercase tracking-tighter text-slate-900">
            Minhas Interações
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            Atividade recente no fórum
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
          <FiMessageSquare size={18} />
        </div>
      </div>

      <div className="space-y-4">
        {myPosts.slice(0, 3).map((post) => {
          const firstImage = post.attachments?.find(
            (a: any) => a.type === "IMAGE" || a.type === "image",
          )?.url;

          return (
            <Link
              key={post.id}
              href={`/forum/post/${post.id}`}
              className="block group"
            >
              <div className="flex gap-4 p-4 rounded-[2rem] bg-slate-50/50 border border-transparent hover:border-(--interface-accent)/20 hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="relative w-20 h-20 shrink-0 rounded-[1.5rem] overflow-hidden bg-slate-200 shadow-inner">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
                      <FiImage className="text-slate-300" size={20} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <span className="text-[9px] font-black text-(--interface-accent) uppercase tracking-widest mb-1">
                    {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <p className="text-sm font-black text-slate-800 truncate group-hover:text-(--interface-accent) transition-colors wrap-break-word max-w-2xl">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <FiMessageSquare size={12} /> {post._count?.comments || 0}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <FiStar size={12} className="text-amber-400" />{" "}
                      {post._count?.likes || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-center pr-2">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-(--interface-accent) group-hover:shadow-md transition-all">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
