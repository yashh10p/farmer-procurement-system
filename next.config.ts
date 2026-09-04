import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow hot reload over local network
  allowedDevOrigins: ["10.10.12.196", "http://10.10.12.196", "http://10.10.12.196:3000", "192.168.137.1", "http://192.168.137.1", "http://192.168.137.1:3000", "192.168.1.8", "http://192.168.1.8", "http://192.168.1.8:3000", "10.194.240.71", "http://10.194.240.71", "http://10.194.240.71:3000", "10.197.33.71", "http://10.197.33.71", "http://10.197.33.71:3000"],
  
  // Use rewrites to proxy Supabase requests through Next.js server port (3000)
  // This bypasses Windows Firewall blocking Docker port 54321 for mobile devices on the network
  async rewrites() {
    return [
      {
        source: '/supabase/:path*',
        destination: 'http://127.0.0.1:54321/:path*'
      }
    ];
  }
};

export default nextConfig;
