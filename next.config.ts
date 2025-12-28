import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer, webpack }) => {
    // Configuração para Remotion
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    // Ignorar arquivos .d.ts (TypeScript declaration files) completamente
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.d\.ts$/,
      })
    );
    
    // Ignorar especificamente o esbuild/lib/main.d.ts
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /esbuild\/lib\/main\.d\.ts$/,
        require.resolve('./empty-module.js')
      )
    );
    
    // Ignorar warnings de self-reference dependency do Remotion
    config.ignoreWarnings = [
      { module: /node_modules\/@remotion/ },
      { message: /Self-reference dependency/ },
      { message: /Module parse failed/ },
    ];
    
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
