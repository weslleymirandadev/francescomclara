import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Link from "next/link";

export function MyPostsWidget() {
  const { data: session } = useSession(); 
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyPosts() {
      try {
        const res = await fetch("/api/user/posts");

        if (!res.ok) {
          console.warn("Rota não encontrada ou erro na API");
          return;
        }
        
        const data = await res.json();
        if (Array.isArray(data)) {
          setMyPosts(data);
        }
      } catch (error) {
        console.error("Erro ao carregar posts do widget:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchMyPosts();
    }
  }, [session]);

  if (loading) return <Loading />;

  return (
    <Card className="p-6">
      <h3 className="font-black text-lg mb-4 italic">MINHAS INTERAÇÕES</h3>
      <div className="space-y-3">
        {myPosts.slice(0, 3).map(post => (
          <Link key={post.id} href={`/forum/post/${post.id}`}>
            <div className="p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
              <p className="text-sm font-bold truncate">{post.title}</p>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {post._count.comments} RESPOSTAS
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}