import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 lg:pl-64 overflow-auto">
        <div className="p-3 lg:p-6 pt-16 lg:pt-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
