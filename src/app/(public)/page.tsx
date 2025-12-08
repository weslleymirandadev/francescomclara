"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

type Course = {
  slug: string;
  title: string;
  description: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  price: number;
};

type Journey = {
  slug: string;
  title: string;
  description: string;
  coursesIncluded: number;
  price: number;
};

const courses: Course[] = [
  {
    slug: "typescript-fundamentos",
    title: "TypeScript Fundamentos",
    description: "Aprenda os fundamentos de TypeScript para projetos modernos.",
    level: "Iniciante",
    price: 97,
  },
  {
    slug: "nextjs-pratico",
    title: "Next.js na Prática",
    description: "Construa aplicações fullstack com o App Router do Next.js.",
    level: "Intermediário",
    price: 147,
  },
];

const journeys: Journey[] = [
  {
    slug: "jornada-fullstack",
    title: "Jornada Fullstack",
    description: "Pacote com os principais cursos para desenvolver aplicações completas.",
    coursesIncluded: 5,
    price: 297,
  },
];

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Home() {
  const { addItem, items } = useCart();

  const hasItems = items.length > 0;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Cursos e Jornadas
          </h1>
          <p className="text-sm text-gray-500">
            Escolha um curso individual ou uma jornada completa e finalize seu
            acesso na próxima etapa.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Cursos</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <article
                key={course.slug}
                className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {course.description}
                  </p>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    {course.level}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-gray-900">
                    {formatPrice(course.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addItem({
                        id: course.slug,
                        title: course.title,
                        price: course.price,
                        type: "course",
                      })
                    }
                    className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Jornadas</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {journeys.map((journey) => (
              <article
                key={journey.slug}
                className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {journey.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {journey.description}
                  </p>
                  <p className="text-xs text-gray-400">
                    Inclui aproximadamente {journey.coursesIncluded} cursos
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-gray-900">
                    {formatPrice(journey.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addItem({
                        id: journey.slug,
                        title: journey.title,
                        price: journey.price,
                        type: "journey",
                      })
                    }
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {hasItems && (
          <div className="flex justify-end">
            <Link
              href="/checkout"
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Ir para checkout
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
