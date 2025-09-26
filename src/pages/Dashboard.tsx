
import { FileUp, FileText, Edit, FileAxis3d, FolderKanban, FileCode2, Settings, Search, Archive } from 'lucide-react';
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
          <Icon className="w-8 h-8 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-4">{description}</p>
          <div className="flex gap-2">
            <Button 
              onClick={onClick}
              className="bg-slate-600 hover:bg-slate-700 text-white"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
          <p className="text-gray-500 mt-2">Upload, organize, and manage your files efficiently</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => navigate('/inventory-dashboard')}
          className="flex items-center gap-2"
        >
          <Archive className="w-4 h-4" />
          Inventory Dashboard
        </Button>
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

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">File Management Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            File Settings
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/files')}
          >
            <Search className="w-4 h-4 mr-2" />
            Advanced Search
          </Button>
        </div>
      </div>
    </div>
  );
};
