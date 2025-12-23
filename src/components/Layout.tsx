import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
