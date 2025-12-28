import { Config } from '@remotion/bundler';

export default {
  // Configuração do Remotion
  webpackOverride: (config: any) => {
    return config;
  },
} satisfies Config;

