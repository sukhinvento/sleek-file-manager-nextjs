
import { FileUp, FileText, Edit } from 'lucide-react';

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: typeof FileUp; 
  title: string; 
  description: string; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 text-left w-full"
  >
    <Icon className="w-8 h-8 text-primary mb-4" />
    <h3 className="text-lg font-semibold text-enterprise-900 mb-2">{title}</h3>
    <p className="text-enterprise-500">{description}</p>
  </button>
);

export const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-enterprise-900">Welcome back</h1>
        <p className="text-enterprise-500 mt-2">Manage your files efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard
          icon={FileUp}
          title="Upload Files"
          description="Upload new files to the system"
          onClick={() => {/* Add navigation */}}
        />
        <QuickActionCard
          icon={FileText}
          title="View Files"
          description="View and manage existing files"
          onClick={() => {/* Add navigation */}}
        />
        <QuickActionCard
          icon={Edit}
          title="Edit Files"
          description="Make changes to your files"
          onClick={() => {/* Add navigation */}}
        />
      </div>
    </div>
  );
};
