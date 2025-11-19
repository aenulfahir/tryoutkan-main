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
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-white min-h-screen text-black">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Pengaturan</h1>
          <p className="text-gray-600 font-medium mt-1">
            System configuration dan settings
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-100 border-2 border-black p-1">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold"
          >
            Email
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold"
          >
            Payment
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold"
          >
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black bg-gray-50">
              <CardTitle className="font-black">General Settings</CardTitle>
              <CardDescription className="font-medium text-gray-600">Basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="app_name" className="font-bold">Application Name</Label>
                <Input id="app_name" defaultValue="TryoutKan" className="border-2 border-black font-medium focus-visible:ring-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="font-bold">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  defaultValue="support@tryoutkan.com"
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_phone" className="font-bold">Support Phone</Label>
                <Input id="support_phone" defaultValue="+62 812-3456-7890" className="border-2 border-black font-medium focus-visible:ring-0" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <div>
                  <Label htmlFor="maintenance" className="font-bold">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600 font-medium">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Switch id="maintenance" className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200 border-2 border-black" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black bg-gray-50">
              <CardTitle className="font-black">Email Templates</CardTitle>
              <CardDescription className="font-medium text-gray-600">Customize email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="welcome_email" className="font-bold">Welcome Email Template</Label>
                <Textarea
                  id="welcome_email"
                  rows={5}
                  defaultValue="Welcome to TryoutKan! We're excited to have you..."
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp_email" className="font-bold">OTP Verification Template</Label>
                <Textarea
                  id="otp_email"
                  rows={5}
                  defaultValue="Your OTP code is: {code}"
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black bg-gray-50">
              <CardTitle className="font-black">Payment Gateway</CardTitle>
              <CardDescription className="font-medium text-gray-600">
                Configure payment gateway settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="xendit_key" className="font-bold">Xendit API Key</Label>
                <Input id="xendit_key" type="password" placeholder="xnd_..." className="border-2 border-black font-medium focus-visible:ring-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook_url" className="font-bold">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  defaultValue="https://tryoutkan.com/api/webhook"
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <div>
                  <Label htmlFor="test_mode" className="font-bold">Test Mode</Label>
                  <p className="text-sm text-gray-600 font-medium">
                    Enable test mode for development
                  </p>
                </div>
                <Switch id="test_mode" className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200 border-2 border-black" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black bg-gray-50">
              <CardTitle className="font-black">System Settings</CardTitle>
              <CardDescription className="font-medium text-gray-600">Advanced system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="max_upload" className="font-bold">Max Upload Size (MB)</Label>
                <Input id="max_upload" type="number" defaultValue="5" className="border-2 border-black font-medium focus-visible:ring-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session_timeout" className="font-bold">
                  Session Timeout (minutes)
                </Label>
                <Input id="session_timeout" type="number" defaultValue="60" className="border-2 border-black font-medium focus-visible:ring-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate_limit" className="font-bold">
                  API Rate Limit (requests/minute)
                </Label>
                <Input id="rate_limit" type="number" defaultValue="100" className="border-2 border-black font-medium focus-visible:ring-0" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
