
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen bg-enterprise-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 ml-16 transition-[margin] duration-300 ease-in-out lg:ml-64">
        {children}
      </main>
    </div>
  );
};
