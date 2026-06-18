import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = {
    userAgent: "*",
    allow: "/",
    disallow: ["/dashboard", "/todos", "/water", "/notes", "/food"],
  };

  if (appUrl) {
    return {
      rules,
      sitemap: `${appUrl}/sitemap.xml`,
    };
  }

  return { rules };
}
