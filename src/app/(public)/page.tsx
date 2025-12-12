"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/price";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  price: number | null;
  discountPrice: number;
  discountEnabled: boolean;
  level: string;
  public: boolean;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const router = useRouter();
  const [accessMap, setAccessMap] = useState<Record<string, { hasAccess: boolean }>>({});

  useEffect(() => {
    async function checkAccess() {
      if (session?.user?.id) {
        const newAccessMap: Record<string, { hasAccess: boolean }> = {};

        // Check access for each course
        await Promise.all(courses.map(async (course) => {
          const itemKey = `course-${course.id}`;
          try {
            const response = await fetch(`/api/user/has-access?type=course&id=${course.id}`);
            const { hasAccess } = await response.json();
            newAccessMap[itemKey] = { hasAccess };
          } catch (error) {
            console.error("Error checking access for course:", course.id, error);
            newAccessMap[itemKey] = { hasAccess: false };
          }
        }));

        setAccessMap(prev => ({ ...prev, ...newAccessMap }));
      }
    }

    if (courses.length > 0) {
      checkAccess();
    }
  }, [session, courses]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch public courses
        const coursesRes = await fetch('/api/courses?public=true');
        if (!coursesRes.ok) throw new Error('Failed to fetch courses');
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar os dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (item: { id: string; title: string; price: number | null; type: 'curso' }) => {
    if (!item.price) {
      toast.error('Este item não pode ser adicionado ao carrinho');
      return;
    }

    // Price is already in cents from the database
    addItem({
      id: item.id,
      title: item.title,
      price: item.price, // Store in cents
    });
    toast.success("Curso adicionado ao carrinho");
  };

  const renderAccessButton = (item: Course) => {
    const itemId = `course-${item.id}`;
    const hasAccess = accessMap[itemId]?.hasAccess || false;

    if (session && hasAccess) {
      return (
        <Link
          href={`/dashboard/cursos/${item.id}`}
          className="w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
        >
          Acessar Curso
        </Link>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          handleAddToCart({
            id: item.id,
            title: item.title,
            price: item.discountPrice || item.price || 0,
            type: 'curso'
          });
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        disabled={loading}
      >
        Adicionar ao Carrinho
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-6">Cursos Disponíveis</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {course.imageUrl && (
                <Link
                  href={`/cursos/${course.id}`}
                >
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                </Link>
              )}
              <div className="p-4">
                <Link
                  href={`/cursos/${course.id}`}
                >
                  <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                </Link>
                <p className="text-gray-600 mb-3 line-clamp-2 h-12">{course.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">{course.level}</span>
                  <div className="text-right">
                    {course.discountEnabled && course.discountPrice > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs line-through text-gray-400">
                          {formatPrice(course.price!)}
                        </span>
                        <span className="font-bold text-red-600">
                          {formatPrice(course.discountPrice)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold">{formatPrice(course.price!)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="mt-4">
                    {renderAccessButton(course)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {status === "authenticated" && (
        <button onClick={() => signOut()}>Log out</button>
      )}
    </main>
  );
}