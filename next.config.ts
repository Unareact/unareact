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
    // Esses warnings são comuns em bibliotecas complexas e não afetam a funcionalidade
    config.ignoreWarnings = [
      { module: /node_modules\/@remotion/ },
      { message: /Self-reference dependency/ },
      { message: /Module parse failed/ },
      { message: /has unused export name/ },
    ];
    
    // Desabilitar tratamento de warnings como erros para módulos do Remotion
    config.stats = config.stats || {};
    if (typeof config.stats === 'object') {
      config.stats.warningsFilter = [
        /Self-reference dependency/,
        /has unused export name/,
        /node_modules\/@remotion/,
      ];
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
  
  // Manter Remotion como pacote externo (não incluir no bundle)
  serverExternalPackages: ['@remotion/bundler', '@remotion/renderer'],
  
  // Configuração de output file tracing para excluir Remotion do bundle
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@remotion/**/*',
      'node_modules/esbuild/**/*.d.ts',
    ],
  },
};

export default nextConfig;
