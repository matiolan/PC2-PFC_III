import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = { themeColor: "#0b0a14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-ink-900 focus:shadow-lg">
          Saltar al contenido
        </a>
        <div id="contenido" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </div>
      </body>
    </html>
  );
}
