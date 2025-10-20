import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Settings saved successfully");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground mt-1">
            System configuration dan settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="app_name">Application Name</Label>
                <Input id="app_name" defaultValue="TryoutKan" />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  defaultValue="support@tryoutkan.com"
                />
              </div>
              <div>
                <Label htmlFor="support_phone">Support Phone</Label>
                <Input id="support_phone" defaultValue="+62 812-3456-7890" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Switch id="maintenance" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="welcome_email">Welcome Email Template</Label>
                <Textarea
                  id="welcome_email"
                  rows={5}
                  defaultValue="Welcome to TryoutKan! We're excited to have you..."
                />
              </div>
              <div>
                <Label htmlFor="otp_email">OTP Verification Template</Label>
                <Textarea
                  id="otp_email"
                  rows={5}
                  defaultValue="Your OTP code is: {code}"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway</CardTitle>
              <CardDescription>
                Configure payment gateway settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="xendit_key">Xendit API Key</Label>
                <Input id="xendit_key" type="password" placeholder="xnd_..." />
              </div>
              <div>
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  defaultValue="https://tryoutkan.com/api/webhook"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="test_mode">Test Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable test mode for development
                  </p>
                </div>
                <Switch id="test_mode" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Advanced system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max_upload">Max Upload Size (MB)</Label>
                <Input id="max_upload" type="number" defaultValue="5" />
              </div>
              <div>
                <Label htmlFor="session_timeout">
                  Session Timeout (minutes)
                </Label>
                <Input id="session_timeout" type="number" defaultValue="60" />
              </div>
              <div>
                <Label htmlFor="rate_limit">
                  API Rate Limit (requests/minute)
                </Label>
                <Input id="rate_limit" type="number" defaultValue="100" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
