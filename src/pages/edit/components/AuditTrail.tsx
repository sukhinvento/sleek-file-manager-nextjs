
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import { AuditEntry } from "../types";

interface AuditTrailProps {
  showAuditTrail: boolean;
  setShowAuditTrail: (show: boolean) => void;
  auditTrail: AuditEntry[];
}

export const AuditTrail = ({
  showAuditTrail,
  setShowAuditTrail,
  auditTrail,
}: AuditTrailProps) => {
  return (
    <Sheet open={showAuditTrail} onOpenChange={setShowAuditTrail}>
      <SheetContent side="right" className="w-full sm:w-[400px]">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              Audit Trail
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-4 pr-4">
            {auditTrail.map((audit) => (
              <div 
                key={audit.id}
                className={`p-4 rounded-lg border shadow-sm ${
                  audit.action === "Data Error" 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-medium ${
                    audit.action === "Data Error" 
                      ? 'text-red-600' 
                      : 'text-enterprise-900'
                  }`}>
                    {audit.action}
                  </span>
                  <span className="text-sm text-enterprise-500">
                    {audit.timestamp}
                  </span>
                </div>
                <p className="text-sm text-enterprise-600">{audit.details}</p>
                <p className="text-xs text-enterprise-400 mt-1">By {audit.user}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
