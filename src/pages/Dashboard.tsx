
import { FileUp, FileText, Edit, FileAxis3d, FolderKanban, FileCode2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  uploadButton,
  IllustrationIcon,
  illustrationColor = "#E5DEFF",
}: { 
  icon: typeof FileUp; 
  title: string; 
  description: string; 
  onClick: () => void;
  uploadButton?: boolean;
  IllustrationIcon: typeof FileAxis3d;
  illustrationColor?: string;
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Files selected:', files);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden">
      <div className="flex">
        <div className="relative z-10 pr-4 flex-1">
          <Icon className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-4">{description}</p>
          <div className="flex gap-2">
            <Button 
              onClick={onClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
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
        <div className="relative flex items-start justify-end">
          <IllustrationIcon 
            className="w-28 h-28 text-purple-100" 
            strokeWidth={0.8}
          />
        </div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 mt-2">Manage your files efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard
          icon={FileUp}
          title="Upload Files"
          description="Upload new files to the system"
          onClick={() => navigate('/upload')}
          uploadButton={true}
          IllustrationIcon={FileAxis3d}
        />
        <QuickActionCard
          icon={FileText}
          title="View Files"
          description="View and manage existing files"
          onClick={() => navigate('/files')}
          IllustrationIcon={FolderKanban}
        />
        <QuickActionCard
          icon={Edit}
          title="Edit Files"
          description="Make changes to your files"
          onClick={() => navigate('/edit')}
          IllustrationIcon={FileCode2}
        />
      </div>
    </div>
  );
};
