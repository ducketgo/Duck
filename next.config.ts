import type { NextConfig } from "next";

// GitHub Pages serves static files only. `NEXT_PUBLIC_BASE_PATH` stays empty
// for a user/organization site such as https://duck.github.io; set it to
// "/<repository>" when the site is published from a project repository.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim().replace(/\/$/, "") || undefined;

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
