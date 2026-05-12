import { MetadataRoute } from "next";
import { siteMetadata } from "@/data/siteMetadata";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

  return {
    rules: [
      {
        userAgent: "*",
        allow: isProd
          ? ["/blog", "/blog/*", "/pricing"]
          : ["/", "/blog", "/blog/*", "/pricing"],
        disallow: [
          ...(isProd ? ["/"] : []),
          "/api/",
          "/d/",
          "/dashboard/",
          "/signup",
          "/signin",
          "/reset-password",
          "/privacy",
          "/terms",
        ],
      },
    ],
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
  };
}
