
import { FileUp, FileText, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  uploadButton 
}: { 
  icon: typeof FileUp; 
  title: string; 
  description: string; 
  onClick: () => void;
  uploadButton?: boolean;
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files selected:', files);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 text-left w-full">
      <Icon className="w-8 h-8 text-primary mb-4" />
      <h3 className="text-lg font-semibold text-enterprise-900 mb-2">{title}</h3>
      <p className="text-enterprise-500 mb-4">{description}</p>
      <div className="flex gap-2">
        <Button onClick={onClick}>
          {title}
        </Button>
        {uploadButton && (
          <div className="relative">
            <Button variant="outline">
              Quick Upload
            </Button>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
              multiple
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();

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
          onClick={() => navigate('/upload')}
          uploadButton={true}
        />
        <QuickActionCard
          icon={FileText}
          title="View Files"
          description="View and manage existing files"
          onClick={() => navigate('/files')}
        />
        <QuickActionCard
          icon={Edit}
          title="Edit Files"
          description="Make changes to your files"
          onClick={() => navigate('/edit')}
        />
      </div>
    </div>
  );
};
