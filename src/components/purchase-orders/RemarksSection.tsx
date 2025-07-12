import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PurchaseOrder } from '../../types/purchaseOrder';

interface RemarksSectionProps {
  order: PurchaseOrder | null;
}

export const RemarksSection = ({ order }: RemarksSectionProps) => {
  const [newRemark, setNewRemark] = useState('');

  const addRemark = () => {
    if (!newRemark.trim()) return;
    
    const newRemarkObj = {
      date: new Date().toISOString().split('T')[0],
      user: 'Current User', // In real app, get from auth context
      message: newRemark
    };
    
    // In real app, this would be saved to backend
    setNewRemark('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Remarks & History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Existing remarks */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-600">Order History</h4>
            {order?.remarks?.map((remark, index: number) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{remark.user}</span>
                    <span className="text-xs text-gray-500">{remark.date}</span>
                  </div>
                  <p className="text-sm">{remark.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add new remark */}
          <div className="space-y-2">
            <Label htmlFor="new-remark">Add Remark</Label>
            <div className="flex gap-2">
              <Textarea
                id="new-remark"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Add a comment about this order..."
                rows={2}
                className="flex-1"
              />
              <Button onClick={addRemark} disabled={!newRemark.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Original notes */}
          {order?.notes && (
            <div className="pt-3 border-t">
              <Label className="text-sm text-gray-600">Original Notes</Label>
              <p className="text-sm mt-1">{order.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
