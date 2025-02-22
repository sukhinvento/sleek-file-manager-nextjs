
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-enterprise-900">Settings</h1>
        <p className="text-enterprise-500 mt-2">Manage your application settings</p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif">Email Notifications</Label>
              <Switch id="email-notif" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="update-notif">Update Notifications</Label>
              <Switch id="update-notif" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
            <CardDescription>Manage your storage settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-delete">Auto Delete Old Files</Label>
              <Switch id="auto-delete" />
            </div>
            <Button variant="outline" className="w-full">
              Clear Cache
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
