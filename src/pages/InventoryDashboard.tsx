import { Package, ShoppingCart, Receipt, Users, ArrowRightLeft, CreditCard, TrendingUp, Package2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  IllustrationIcon,
  badgeText,
  badgeColor = "bg-blue-100 text-blue-800",
}: { 
  icon: typeof Package; 
  title: string; 
  description: string; 
  onClick: () => void;
  IllustrationIcon: typeof Package2;
  badgeText?: string;
  badgeColor?: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="relative z-10 pr-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <Icon className="w-8 h-8 text-slate-600" />
            {badgeText && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
                {badgeText}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-4 text-sm">{description}</p>
          <Button 
            onClick={onClick}
            className="bg-slate-600 hover:bg-slate-700 text-white"
          >
            Go to {title}
          </Button>
        </div>
        <div className="relative flex items-start justify-end">
          <IllustrationIcon 
            className="w-20 h-20 text-purple-100" 
            strokeWidth={0.8}
          />
        </div>
      </div>
    </div>
  );
};

export const InventoryDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-2">Manage your inventory, orders, and vendor relationships</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          File Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard
          icon={Package}
          title="Inventory"
          description="Track stock levels, manage items, and monitor inventory status"
          onClick={() => navigate('/inventory')}
          IllustrationIcon={Package2}
          badgeText="Stock"
          badgeColor="bg-green-100 text-green-800"
        />
        
        <QuickActionCard
          icon={ShoppingCart}
          title="Purchase Orders"
          description="Create and manage purchase orders from vendors"
          onClick={() => navigate('/purchase-orders')}
          IllustrationIcon={ShoppingCart}
          badgeText="PO"
          badgeColor="bg-blue-100 text-blue-800"
        />
        
        <QuickActionCard
          icon={Receipt}
          title="Sales Orders"
          description="Process customer orders and track sales"
          onClick={() => navigate('/sales-orders')}
          IllustrationIcon={Receipt}
          badgeText="SO"
          badgeColor="bg-purple-100 text-purple-800"
        />
        
        <QuickActionCard
          icon={Users}
          title="Vendors"
          description="Manage vendor information and relationships"
          onClick={() => navigate('/vendors')}
          IllustrationIcon={Users}
          badgeText="Suppliers"
          badgeColor="bg-orange-100 text-orange-800"
        />
        
        <QuickActionCard
          icon={ArrowRightLeft}
          title="Stock Transfer"
          description="Transfer inventory between locations"
          onClick={() => navigate('/stock-transfer')}
          IllustrationIcon={ArrowRightLeft}
          badgeText="Transfer"
          badgeColor="bg-yellow-100 text-yellow-800"
        />
        
        <QuickActionCard
          icon={CreditCard}
          title="Billing"
          description="Manage invoices, payments, and financial records"
          onClick={() => navigate('/billing')}
          IllustrationIcon={CreditCard}
          badgeText="Finance"
          badgeColor="bg-red-100 text-red-800"
        />
      </div>

      <div className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-slate-600" />
          <h2 className="text-xl font-semibold text-gray-900">Quick Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/analytics/usage')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Usage Analytics
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/analytics/trends')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends Analysis
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/analytics/distribution')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Distribution
          </Button>
        </div>
      </div>
    </div>
  );
};