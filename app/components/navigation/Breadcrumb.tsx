'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb() {
  const pathname = usePathname();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    if (paths.length === 0) return breadcrumbs;

    // Mapear rotas para labels
    const routeLabels: Record<string, string> = {
      react: 'React',
      portal: 'Portal Magra',
      nutri: 'YLADA Nutri',
      viral: 'Vídeos Virais',
      editor: 'Editor',
      preview: 'Preview',
      export: 'Exportar',
      templates: 'Templates',
      script: 'Roteiro',
    };

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);
      const isLast = index === paths.length - 1;
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-2">
            {index === 0 ? (
              <Link
                href={item.href || '/'}
                className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <Home className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn(
                    "font-medium",
                    isLast && "text-gray-900 dark:text-gray-100"
                  )}>
                    {item.label}
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}

