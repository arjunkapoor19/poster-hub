/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "njrjnitwpwxvgwzawova.supabase.co",
        port: "",
        pathname: "/storage/v1/render/image/public/**",
      },
    ],
  },
}

export default nextConfig
