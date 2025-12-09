// @ts-nocheck
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script
        src="https://www.mercadopago.com/v2/security.js"
        //@ts-ignore
        view="checkout"
        output="deviceId"
      ></Script>
      <Script src="https://sdk.mercadopago.com/js/v2"
      onLoad={() => {
          if (window.MercadoPago) {
            // Substitua 'SUA_PUBLIC_KEY' pela sua chave pública do Mercado Pago
            window.MercadoPago.set
            window.MercadoPago.set
            window.MercadoPago.setPublishableKey(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
          }
        }}
      ></Script>
      {children}
    </>
  );
}