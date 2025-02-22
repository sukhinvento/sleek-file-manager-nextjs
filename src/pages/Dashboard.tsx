
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
  illustrationWidth = "20%"
}: { 
  icon: typeof FileUp; 
  title: string; 
  description: string; 
  onClick: () => void;
  uploadButton?: boolean;
  IllustrationIcon: typeof FileAxis3d;
  illustrationColor?: string;
  illustrationWidth?: string;
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Files selected:', files);
    }
  };

  return (
    <div className="relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 text-left w-full overflow-hidden group">
      <div className="flex">
        {/* Content */}
        <div className="relative z-10 flex-1 pr-4" style={{ width: "80%" }}>
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

        {/* Vector Illustration */}
        <div className="relative flex items-start justify-end" style={{ width: illustrationWidth }}>
          <div className="absolute inset-0 bg-enterprise-100/30 opacity-10 group-hover:opacity-20 transition-opacity duration-200" />
          <div className="relative">
            {/* Background glow effect - more subtle */}
            <div 
              className="absolute inset-0 blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-200"
              style={{ backgroundColor: illustrationColor }}
            />
            <IllustrationIcon 
              className="w-28 h-28 transition-all duration-200 group-hover:scale-105" 
              strokeWidth={0.8}
              style={{ color: illustrationColor }}
            />
          </div>
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
          IllustrationIcon={FileAxis3d}
          illustrationColor="#E5DEFF"
        />
        <QuickActionCard
          icon={FileText}
          title="View Files"
          description="View and manage existing files"
          onClick={() => navigate('/files')}
          IllustrationIcon={FolderKanban}
          illustrationColor="#D3E4FD"
        />
        <QuickActionCard
          icon={Edit}
          title="Edit Files"
          description="Make changes to your files"
          onClick={() => navigate('/edit')}
          IllustrationIcon={FileCode2}
          illustrationColor="#F1F0FB"
        />
      </div>
    </div>
  );
};
