
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-enterprise-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 ml-16 transition-all duration-300 ease-in-out lg:ml-64 w-[calc(100%-4rem)] lg:w-[calc(100%-16rem)]">
        {children}
      </main>
    </div>
  );
};
