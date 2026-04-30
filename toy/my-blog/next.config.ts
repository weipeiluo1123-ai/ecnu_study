import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // MDX files are handled by gray-matter + next-mdx-remote at runtime
  pageExtensions: ["ts", "tsx", "js", "jsx"],
};

export default nextConfig;
