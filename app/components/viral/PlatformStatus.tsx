'use client';

import { PLATFORMS, getPlatformInfo } from '@/app/lib/platforms';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function PlatformStatus() {
  const platforms = Object.entries(PLATFORMS);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-development':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'planned':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'Implementado';
      case 'in-development':
        return 'Em Desenvolvimento';
      case 'planned':
        return 'Planejado';
      default:
        return 'Não Disponível';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Status das Plataformas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map(([key, config]) => (
          <div
            key={key}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              config.status === 'implemented'
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : config.status === 'in-development'
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {config.name}
              </h4>
              {getStatusIcon(config.status)}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  config.status === 'implemented'
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : config.status === 'in-development'
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                )}>
                  {getStatusLabel(config.status)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  config.isFree ? "bg-green-500" : "bg-orange-500"
                )} />
                <span>{config.isFree ? 'Gratuito' : 'Pago'}</span>
              </div>
              {config.dailyLimit && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Limite: {config.dailyLimit.toLocaleString()}/dia
                </p>
              )}
              {config.cost && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {config.cost}
                </p>
              )}
              {config.requiresApproval && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  ⚠️ Requer aprovação
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Nota:</strong> Algumas plataformas têm limitações de acesso. 
          Consulte o guia completo em <code className="text-purple-600">GUIA_APIS_PLATAFORMAS.md</code>
        </p>
      </div>
    </div>
  );
}

