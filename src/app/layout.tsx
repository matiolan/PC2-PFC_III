import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pc2-pfc-iii.vercel.app"),
  title: {
    default: "Gamarra Conecta · Formalízate y vende más",
    template: "%s",
  },
  description:
    "Plataforma para que los negocios de Gamarra se formalicen paso a paso: vitrina mayorista, cotización por WhatsApp y empleo formal.",
  openGraph: {
    title: "Gamarra Conecta",
    description: "Formalízate paso a paso y conviértelo en más clientes.",
    locale: "es_PE",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
