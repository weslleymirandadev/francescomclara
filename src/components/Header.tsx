"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="fixed w-full border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-gray-900">
          programacao.dev
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden text-xs font-medium text-gray-600 hover:text-gray-900 sm:inline-flex"
          >
            Cursos
          </Link>
        </div>
      </div>
    </header>
  );
}

