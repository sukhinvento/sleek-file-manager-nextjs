
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen bg-enterprise-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
};
