/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: "http://backend:80/:path*" }];
  },
};

module.exports = nextConfig;
