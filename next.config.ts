import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "njrjnitwpwxvgwzawova.supabase.co",
        pathname: "/storage/v1/render/image/public/**",
      },
    ],
  },
}

export default nextConfig
