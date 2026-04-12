// @ts-nocheck
"use client";

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* 1. Script de Segurança (Antifraude) */}
      <Script
        src="https://www.mercadopago.com/v2/security.js"
        strategy="afterInteractive"
        view="checkout"
        output="deviceId"
      />

      {/* 2. SDK Principal do Mercado Pago */}
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => {
          if (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
            window.mp = new window.MercadoPago(
              process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
            );
            console.log("Mercado Pago Initialized");
          }
        }}
      />

      {children}
    </>
  );
}
