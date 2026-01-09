import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="backdrop-blur-xl bg-slate-900/80 border-b border-[#1e293b] sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0 pl-12 lg:pl-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#f1f5f9] tracking-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
