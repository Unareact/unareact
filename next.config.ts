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
    // Excluir módulos nativos do Remotion do processamento do webpack
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push({
        '@remotion/compositor-darwin-arm64': 'commonjs @remotion/compositor-darwin-arm64',
        '@remotion/compositor-darwin-x64': 'commonjs @remotion/compositor-darwin-x64',
        '@remotion/compositor-linux-arm64-gnu': 'commonjs @remotion/compositor-linux-arm64-gnu',
        '@remotion/compositor-linux-arm64-musl': 'commonjs @remotion/compositor-linux-arm64-musl',
        '@remotion/compositor-win32-x64-msvc': 'commonjs @remotion/compositor-win32-x64-msvc',
      });
    }
    return config;
  },
  // Configuração vazia do Turbopack para silenciar o erro
  // O webpack será usado quando necessário (para Remotion)
  turbopack: {},
};

export default nextConfig;
