import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

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
        
        // Agora pegamos os posts diretamente do objeto do usuário
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
        <h3 className="font-black text-lg mb-4 italic uppercase tracking-tighter">Minhas Interações</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nenhuma interação recente.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white">
      <h3 className="font-black text-lg mb-4 italic uppercase tracking-tighter">Minhas Interações</h3>
      <div className="space-y-3">
        {myPosts.slice(0, 3).map(post => (
          <Link key={post.id} href={`/forum/post/${post.id}`} className="block">
            <div className="p-4 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 hover:border-clara-rose/30 group">
              <p className="text-sm font-bold truncate text-slate-700 group-hover:text-clara-rose transition-colors">{post.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-clara-rose font-black uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">
                  {post._count?.comments || 0} RESPOSTAS
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}