
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-enterprise-50">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
