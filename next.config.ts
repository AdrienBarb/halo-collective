import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Google One Tap (GSI) needs the Referer header to validate origins
  // against Authorized JavaScript origins. The default Next.js policy
  // strips it cross-origin, causing "origin not allowed" errors.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
        ],
      },
    ];
  },
  // Image optimization for external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(isDev
        ? ([
            {
              protocol: "http",
              hostname: "127.0.0.1",
              pathname: "/storage/v1/object/public/**",
            },
            {
              protocol: "http",
              hostname: "localhost",
              pathname: "/storage/v1/object/public/**",
            },
          ] as const)
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);
