import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Configuração para Remotion
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  // Configuração vazia do Turbopack para silenciar o erro
  // O webpack config acima será usado quando necessário
  turbopack: {},
};

export default nextConfig;
