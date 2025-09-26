import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Eye,
  ShoppingCart,
  Users
} from 'lucide-react';
import { inventoryItemsData, vendorsData, salesOrdersData } from '@/data/inventoryData';
import { SummaryCard } from '@/components/inventory/SummaryCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Helper functions for calculations
const getStockStatus = (current: number, min: number, reorderPoint: number = min * 1.5) => {
  if (current <= min) return 'critical';
  if (current <= reorderPoint) return 'low';
  return 'normal';
};

const calculateInventoryMetrics = () => {
  const totalItems = inventoryItemsData.length;
  const criticalStock = inventoryItemsData.filter(item => 
    getStockStatus(item.currentStock, item.minStock) === 'critical'
  ).length;
  const lowStock = inventoryItemsData.filter(item => 
    getStockStatus(item.currentStock, item.minStock) === 'low'
  ).length;
  const outOfStock = inventoryItemsData.filter(item => item.currentStock === 0).length;
  const totalValue = inventoryItemsData.reduce((sum, item) => 
    sum + (item.currentStock * item.unitPrice), 0
  );
  const categories = [...new Set(inventoryItemsData.map(item => item.category))].length;
  
  return {
    totalItems,
    criticalStock,
    lowStock,
    outOfStock,
    totalValue,
    categories,
    normalStock: totalItems - criticalStock - lowStock - outOfStock
  };
};

const CategoryBreakdown = () => {
  const categoryData = inventoryItemsData.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0, critical: 0 };
    }
    acc[category].count += 1;
    acc[category].value += item.currentStock * item.unitPrice;
    if (getStockStatus(item.currentStock, item.minStock) === 'critical') {
      acc[category].critical += 1;
    }
    return acc;
  }, {} as Record<string, { count: number; value: number; critical: number }>);

  return (
    <Card className="summary-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 icon-accent" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(categoryData).map(([category, data]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{category}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{data.count} items</span>
                {data.critical > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {data.critical} critical
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Value: ${data.value.toLocaleString()}
              </span>
              <Progress 
                value={(data.count / inventoryItemsData.length) * 100} 
                className="w-20 h-2"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const RecentActivity = () => {
  const recentOrders = salesOrdersData.slice(0, 3);
  
  return (
    <Card className="summary-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 icon-accent" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-sm">{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">{order.customerName}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-semibold text-sm">${order.total.toLocaleString()}</p>
              <Badge 
                variant={order.status === 'Delivered' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {order.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="summary-card">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => navigate('/inventory')}
          className="w-full justify-start"
          variant="ghost"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Full Inventory
        </Button>
        <Button 
          onClick={() => navigate('/purchase-orders')}
          className="w-full justify-start" 
          variant="ghost"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
        <Button 
          onClick={() => navigate('/vendors')}
          className="w-full justify-start"
          variant="ghost"
        >
          <Users className="mr-2 h-4 w-4" />
          Manage Vendors
        </Button>
      </CardContent>
    </Card>
  );
};

export const InventoryDashboard = () => {
  const metrics = calculateInventoryMetrics();
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inventory Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your inventory status and key metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Items"
          value={metrics.totalItems}
          icon={Package}
          subtitle={`${metrics.categories} categories`}
          gradient={true}
        />
        
        <SummaryCard
          title="Critical Stock"
          value={metrics.criticalStock}
          icon={AlertTriangle}
          badge={{ 
            text: metrics.criticalStock > 0 ? 'Action Required' : 'All Good',
            variant: metrics.criticalStock > 0 ? 'destructive' : 'default'
          }}
        />
        
        <SummaryCard
          title="Low Stock"
          value={metrics.lowStock}
          icon={TrendingUp}
          badge={{
            text: `${metrics.normalStock} Normal`,
            variant: 'secondary'
          }}
        />
        
        <SummaryCard
          title="Total Value"
          value={`$${metrics.totalValue.toLocaleString()}`}
          icon={DollarSign}
          subtitle="Current stock value"
          gradient={true}
        />
      </div>

      {/* Charts and Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CategoryBreakdown />
          <RecentActivity />
        </div>
        
        <div className="space-y-6">
          <QuickActions />
          
          {/* Stock Status Overview */}
          <Card className="summary-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 icon-accent" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Normal Stock</span>
                  <span className="text-sm font-medium text-green-600">
                    {metrics.normalStock} items
                  </span>
                </div>
                <Progress 
                  value={(metrics.normalStock / metrics.totalItems) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Low Stock</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {metrics.lowStock} items
                  </span>
                </div>
                <Progress 
                  value={(metrics.lowStock / metrics.totalItems) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Critical Stock</span>
                  <span className="text-sm font-medium text-red-600">
                    {metrics.criticalStock} items
                  </span>
                </div>
                <Progress 
                  value={(metrics.criticalStock / metrics.totalItems) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};