"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/price";

export function Header() {
  const { items, total, removeItem, isCartOpen, openCart, closeCart } = useCart();
  const itemsCount = items.length;

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

          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
          >
            <span>Carrinho</span>
            {itemsCount > 0 && (
              <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
                {itemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overlay + Drawer */}
      {isCartOpen && typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-40 flex items-stretch">
            <div
              className="flex-1"
              onClick={closeCart}
            />
            {/* Drawer: mobile = w-full, desktop = coluna à direita */}
            <div className="ml-auto flex h-dvh w-full flex-col bg-white shadow-xl sm:w-[420px] sm:border-l sm:border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Seu carrinho</h2>
                <button
                  type="button"
                  onClick={closeCart}
                  className="text-xs font-medium text-gray-500 hover:text-gray-800"
                >
                  Fechar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3">
                {items.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Seu carrinho está vazio. Adicione cursos para continuar.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-md border border-gray-200 p-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-[11px] uppercase text-gray-400">
                            Curso
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[11px] font-medium text-red-500 hover:text-red-600"
                          >
                            Remover
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-gray-200 px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Total</span>
                  <span className="text-base font-semibold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={items.length === 0 ? "#" : "/checkout"}
                    onClick={(e) => {
                      if (items.length === 0) {
                        e.preventDefault();
                        return;
                      }
                      closeCart();
                    }}
                    aria-disabled={items.length === 0}
                    className={`inline-flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                      items.length === 0
                        ? "cursor-not-allowed bg-emerald-800"
                        : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    Ir para checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          
          document.body
        )}
    </header>
  );
}

