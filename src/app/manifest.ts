import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gamarra Conecta",
    short_name: "Gamarra Conecta",
    description: "Formalízate paso a paso y vende más: vitrina mayorista, cotización por WhatsApp y empleo formal.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0a14",
    theme_color: "#5130e0",
    lang: "es-PE",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
