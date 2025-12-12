"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/price";
import { useRouter } from "next/navigation";

type Track = {
  id: string;
  name: string;
  description: string;
  objective: 'TRAVEL' | 'WORK' | 'FAMILY' | 'KNOWLEDGE';
  imageUrl: string | null;
  order: number;
  active: boolean;
  courses: Array<{
    order: number;
    course: {
      id: string;
      title: string;
      description: string;
      imageUrl: string | null;
      price: number | null;
      level: string;
    };
  }>;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  discountPrice: number | null;
  discountEnabled: boolean;
  type: 'INDIVIDUAL' | 'FAMILY';
  period: 'MONTHLY' | 'YEARLY';
  features: any;
  courses: Array<{
    id: string;
    title: string;
    price: number | null;
  }>;
  active: boolean;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [accessMap, setAccessMap] = useState<Record<string, { hasAccess: boolean }>>({});

  useEffect(() => {
    async function checkAccess() {
      if (session?.user?.id && tracks.length > 0) {
        const newAccessMap: Record<string, { hasAccess: boolean }> = {};

        // Check access for each course in all tracks
        const allCourses = tracks.flatMap(track => 
          track.courses.map(tc => tc.course)
        );

        await Promise.all(allCourses.map(async (course) => {
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

    if (tracks.length > 0) {
      checkAccess();
    }
  }, [session, tracks]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch tracks and subscription plans
        const [tracksRes, plansRes] = await Promise.all([
          fetch('/api/tracks?active=true'),
          fetch('/api/subscription-plans?active=true'),
        ]);

        if (!tracksRes.ok) throw new Error('Failed to fetch tracks');
        const tracksData = await tracksRes.json();
        setTracks(tracksData);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setSubscriptionPlans(plansData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar os dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getObjectiveLabel = (objective: string) => {
    const labels: Record<string, string> = {
      TRAVEL: 'Viagens',
      WORK: 'Trabalho',
      FAMILY: 'Família',
      KNOWLEDGE: 'Conhecimento',
    };
    return labels[objective] || objective;
  };

  const renderAccessButton = (course: Track['courses'][0]['course']) => {
    const itemId = `course-${course.id}`;
    const hasAccess = accessMap[itemId]?.hasAccess || false;

    if (session && hasAccess) {
      return (
        <Link
          href={`/dashboard/cursos/${course.id}`}
          className="w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors text-sm"
        >
          Acessar Curso
        </Link>
      );
    }

    return (
      <Link
        href={`/cursos/${course.id}`}
        className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-sm"
      >
        Ver Detalhes
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPeriodLabel = (period: string) => {
    return period === 'MONTHLY' ? 'Mensal' : 'Anual';
  };

  const getTypeLabel = (type: string) => {
    return type === 'INDIVIDUAL' ? 'Individual' : 'Família';
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Seção de Planos de Assinatura */}
      {subscriptionPlans.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Planos de Assinatura</h1>
            <p className="text-gray-600 text-lg">
              Escolha o plano ideal para você e tenha acesso completo aos nossos cursos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {subscriptionPlans.map((plan) => {
              const displayPrice = plan.discountEnabled && plan.discountPrice 
                ? plan.discountPrice 
                : plan.price;
              const monthlyPrice = plan.period === 'YEARLY' 
                ? Math.round(displayPrice / 12) 
                : displayPrice;

              return (
                <div
                  key={plan.id}
                  className="border-2 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white"
                >
                  <div className="p-6">
                    {/* Badge de tipo e período */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {getTypeLabel(plan.type)}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {getPeriodLabel(plan.period)}
                      </span>
                    </div>

                    {/* Nome do plano */}
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    
                    {/* Descrição */}
                    {plan.description && (
                      <p className="text-gray-600 mb-4 text-sm">{plan.description}</p>
                    )}

                    {/* Preço */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(monthlyPrice)}
                        </span>
                        <span className="text-gray-500">/mês</span>
                      </div>
                      {plan.period === 'YEARLY' && (
                        <p className="text-sm text-gray-500 mt-1">
                          {formatPrice(displayPrice)} por ano
                        </p>
                      )}
                      {plan.discountEnabled && plan.discountPrice && plan.originalPrice && (
                        <div className="mt-2">
                          <span className="text-sm line-through text-gray-400">
                            {formatPrice(plan.originalPrice)}
                          </span>
                          <span className="ml-2 text-sm font-semibold text-red-600">
                            Economize {formatPrice(plan.originalPrice - plan.discountPrice)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                      <ul className="mb-6 space-y-2">
                        {plan.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start text-sm text-gray-700">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Número de cursos */}
                    {plan.courses && plan.courses.length > 0 && (
                      <p className="text-sm text-gray-600 mb-6">
                        <span className="font-semibold">{plan.courses.length}</span> curso{plan.courses.length > 1 ? 's' : ''} incluído{plan.courses.length > 1 ? 's' : ''}
                      </p>
                    )}

                    {/* Botão de assinatura */}
                    <Link
                      href={`/assinar?planId=${plan.id}`}
                      className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                      Assinar Agora
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Seção de Trilhas */}
      {tracks.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trilhas de Aprendizado</h2>
            <p className="text-gray-600 text-lg">
              Escolha uma trilha baseada no seu objetivo e aprenda francês de forma direcionada
            </p>
          </div>

          <div className="space-y-12">
            {tracks.map((track) => (
              <div key={track.id} className="border rounded-lg overflow-hidden shadow-lg bg-white">
                {/* Header da Trilha */}
                <div className="bg-linear-to-r from-blue-600 to-blue-800 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-2">
                        {getObjectiveLabel(track.objective)}
                      </span>
                      <h3 className="text-2xl font-bold mb-2">{track.name}</h3>
                      <p className="text-blue-100">{track.description}</p>
                    </div>
                    {track.imageUrl && (
                      <img
                        src={track.imageUrl}
                        alt={track.name}
                        className="w-24 h-24 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>
                </div>

                {/* Cursos da Trilha */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">
                    Cursos desta trilha ({track.courses.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {track.courses.map((trackCourse) => {
                      const course = trackCourse.course;
                      return (
                        <div
                          key={course.id}
                          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                          {course.imageUrl && (
                            <Link href={`/cursos/${course.id}`}>
                              <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="w-full h-32 object-cover"
                              />
                            </Link>
                          )}
                          <div className="p-4">
                            <Link href={`/cursos/${course.id}`}>
                              <h5 className="font-semibold mb-1 text-gray-900 line-clamp-2">
                                {course.title}
                              </h5>
                            </Link>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-gray-500">{course.level}</span>
                              {course.price && (
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatPrice(course.price)}
                                </span>
                              )}
                            </div>
                            {renderAccessButton(course)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {status === "authenticated" && (
        <button onClick={() => signOut()}>Log out</button>
      )}
    </main>
  );
}