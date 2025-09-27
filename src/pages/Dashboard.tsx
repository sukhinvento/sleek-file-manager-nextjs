
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
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative z-10 flex-1 mb-4 sm:mb-0 sm:pr-4">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">{description}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={onClick}
              className="bg-slate-600 hover:bg-slate-700 text-white w-full sm:w-auto"
              size="sm"
            >
              {title}
            </Button>
            {uploadButton && (
              <div className="relative">
                <Button variant="outline" className="w-full sm:w-auto" size="sm">
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
        <div className="relative flex items-center justify-center sm:items-start sm:justify-end">
          <IllustrationIcon 
            className="w-20 h-20 sm:w-28 sm:h-28 text-purple-100" 
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 sm:space-y-0">
          {/* Mobile: Stack cards vertically */}
          <div className="flex flex-col gap-4 sm:hidden">
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

          {/* Desktop: Horizontal scroll on tablets, grid on large screens */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-max lg:grid lg:grid-cols-3 lg:min-w-0">
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
          </div>
        </div>
      </div>
    </div>
  );
};
