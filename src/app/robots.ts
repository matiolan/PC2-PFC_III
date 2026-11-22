import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pc2-pfc-iii.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/auth", "/actualizar-clave"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
