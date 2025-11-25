import { useState, useEffect } from "react";
import { Save, Loader2, RefreshCw } from "lucide-react";
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
import { getSettings, updateSettings } from "@/services/settingsService";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { map } = await getSettings();
      setSettings(map);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettings(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-white min-h-screen text-black">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Pengaturan</h1>
          <p className="text-gray-600 font-medium mt-1">
            System configuration dan settings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchSettings}
            className="border-2 border-black font-bold hover:bg-gray-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-100 border-2 border-black p-1 flex flex-wrap h-auto">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold flex-1 min-w-[100px]"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold flex-1 min-w-[100px]"
          >
            Email
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold flex-1 min-w-[100px]"
          >
            Payment
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold flex-1 min-w-[100px]"
          >
            System
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold flex-1 min-w-[100px]"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="tryout"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold flex-1 min-w-[100px]"
          >
            Tryout
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
                <Input
                  id="app_name"
                  value={settings.app_name || ""}
                  onChange={(e) => handleChange("app_name", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="font-bold">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email || ""}
                  onChange={(e) => handleChange("contact_email", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_phone" className="font-bold">Support Phone</Label>
                <Input
                  id="support_phone"
                  value={settings.support_phone || ""}
                  onChange={(e) => handleChange("support_phone", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <div>
                  <Label htmlFor="maintenance_mode" className="font-bold">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600 font-medium">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Switch
                  id="maintenance_mode"
                  checked={settings.maintenance_mode === true || settings.maintenance_mode === "true"}
                  onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200 border-2 border-black"
                />
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
                <Label htmlFor="welcome_email_template" className="font-bold">Welcome Email Template</Label>
                <Textarea
                  id="welcome_email_template"
                  rows={5}
                  value={settings.welcome_email_template || ""}
                  onChange={(e) => handleChange("welcome_email_template", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp_email_template" className="font-bold">OTP Verification Template</Label>
                <Textarea
                  id="otp_email_template"
                  rows={5}
                  value={settings.otp_email_template || ""}
                  onChange={(e) => handleChange("otp_email_template", e.target.value)}
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
                <Label htmlFor="xendit_secret_key" className="font-bold">Xendit Secret Key</Label>
                <Input
                  id="xendit_secret_key"
                  type="password"
                  value={settings.xendit_secret_key || ""}
                  onChange={(e) => handleChange("xendit_secret_key", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xendit_webhook_url" className="font-bold">Webhook URL</Label>
                <Input
                  id="xendit_webhook_url"
                  value={settings.xendit_webhook_url || ""}
                  onChange={(e) => handleChange("xendit_webhook_url", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <div>
                  <Label htmlFor="payment_test_mode" className="font-bold">Test Mode</Label>
                  <p className="text-sm text-gray-600 font-medium">
                    Enable test mode for development
                  </p>
                </div>
                <Switch
                  id="payment_test_mode"
                  checked={settings.payment_test_mode === true || settings.payment_test_mode === "true"}
                  onCheckedChange={(checked) => handleChange("payment_test_mode", checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200 border-2 border-black"
                />
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
                <Label htmlFor="max_upload_size" className="font-bold">Max Upload Size (MB)</Label>
                <Input
                  id="max_upload_size"
                  type="number"
                  value={settings.max_upload_size || ""}
                  onChange={(e) => handleChange("max_upload_size", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session_timeout" className="font-bold">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={settings.session_timeout || ""}
                  onChange={(e) => handleChange("session_timeout", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_rate_limit" className="font-bold">
                  API Rate Limit (requests/minute)
                </Label>
                <Input
                  id="api_rate_limit"
                  type="number"
                  value={settings.api_rate_limit || ""}
                  onChange={(e) => handleChange("api_rate_limit", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black bg-gray-50">
              <CardTitle className="font-black">Appearance</CardTitle>
              <CardDescription className="font-medium text-gray-600">Customize look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="theme_mode" className="font-bold">Default Theme</Label>
                <div className="flex space-x-4">
                  <div
                    className={`cursor-pointer border-2 p-2 rounded-lg ${settings.theme_mode === 'light' ? 'border-black bg-gray-100' : 'border-gray-200'}`}
                    onClick={() => handleChange("theme_mode", "light")}
                  >
                    <div className="w-20 h-12 bg-white border border-gray-300 rounded mb-2"></div>
                    <p className="text-center font-bold text-sm">Light</p>
                  </div>
                  <div
                    className={`cursor-pointer border-2 p-2 rounded-lg ${settings.theme_mode === 'dark' ? 'border-black bg-gray-100' : 'border-gray-200'}`}
                    onClick={() => handleChange("theme_mode", "dark")}
                  >
                    <div className="w-20 h-12 bg-gray-900 border border-gray-700 rounded mb-2"></div>
                    <p className="text-center font-bold text-sm">Dark</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_color" className="font-bold">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={settings.primary_color || "#000000"}
                    onChange={(e) => handleChange("primary_color", e.target.value)}
                    className="w-12 h-12 p-1 border-2 border-black cursor-pointer"
                  />
                  <Input
                    value={settings.primary_color || "#000000"}
                    onChange={(e) => handleChange("primary_color", e.target.value)}
                    className="border-2 border-black font-medium focus-visible:ring-0 w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tryout" className="space-y-4">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black bg-gray-50">
              <CardTitle className="font-black">Tryout Configuration</CardTitle>
              <CardDescription className="font-medium text-gray-600">Default settings for tryouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="default_exam_duration" className="font-bold">Default Duration (minutes)</Label>
                <Input
                  id="default_exam_duration"
                  type="number"
                  value={settings.default_exam_duration || ""}
                  onChange={(e) => handleChange("default_exam_duration", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passing_grade" className="font-bold">Default Passing Grade</Label>
                <Input
                  id="passing_grade"
                  type="number"
                  value={settings.passing_grade || ""}
                  onChange={(e) => handleChange("passing_grade", e.target.value)}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <div>
                  <Label htmlFor="show_results_immediately" className="font-bold">Show Results Immediately</Label>
                  <p className="text-sm text-gray-600 font-medium">
                    Show results to students right after submission
                  </p>
                </div>
                <Switch
                  id="show_results_immediately"
                  checked={settings.show_results_immediately === true || settings.show_results_immediately === "true"}
                  onCheckedChange={(checked) => handleChange("show_results_immediately", checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200 border-2 border-black"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

