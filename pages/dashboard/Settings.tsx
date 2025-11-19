import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User as UserIcon,
  Lock,
  Bell,
  Moon,
  Sun,
  Save,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  type Profile,
} from "@/services/profile";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Password state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadUserData();
    checkDarkMode();
  }, [user]);

  function checkDarkMode() {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }

  async function loadUserData() {
    if (!user) return;

    try {
      setLoading(true);

      console.log("📋 Loading user profile data...");

      // Load from profiles table
      const profileData = await getCurrentUserProfile();

      if (profileData) {
        setProfile(profileData);
        setName(profileData.name || "");
        setEmail(profileData.email || "");
        setPhone(profileData.phone || "");
        setBio(profileData.bio || "");
        setDateOfBirth(profileData.date_of_birth || "");
        setGender(profileData.gender || "");
        setAvatarUrl(profileData.avatar_url);

        console.log("✅ Profile loaded:", profileData);
      } else {
        // Fallback to auth metadata if profile not found
        setEmail(user.email || "");
        setName(user.user_metadata?.name || "");
        setPhone(user.user_metadata?.phone || "");

        console.log("⚠️ Profile not found, using auth metadata");
      }

      // Load preferences from localStorage
      const savedEmailNotif = localStorage.getItem("emailNotifications");
      const savedPushNotif = localStorage.getItem("pushNotifications");
      if (savedEmailNotif !== null) {
        setEmailNotifications(savedEmailNotif === "true");
      }
      if (savedPushNotif !== null) {
        setPushNotifications(savedPushNotif === "true");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!user) return;

    // Validation
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
      toast.error("Format nomor telepon tidak valid");
      return;
    }

    try {
      setSaving(true);

      console.log("💾 Saving profile...");

      // Update profile in database
      const updatedProfile = await updateCurrentUserProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        date_of_birth: dateOfBirth || undefined,
        gender: gender || undefined,
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        console.log("✅ Profile saved:", updatedProfile);
      }

      // Also update auth metadata for backward compatibility
      await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          phone: phone.trim(),
        },
      });

      toast.success("Profil Berhasil Diperbarui", {
        description: "Data profil Anda telah disimpan.",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Gagal Menyimpan Profil", {
        description:
          error.message || "Terjadi kesalahan saat menyimpan profil.",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleAvatarChange(newAvatarUrl: string | null) {
    setAvatarUrl(newAvatarUrl);
    // Reload profile to get updated data
    loadUserData();
  }

  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) {
      toast.error("Password tidak boleh kosong");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    try {
      setChangingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password Berhasil Diubah", {
        description: "Password Anda telah diperbarui.",
      });

      setShowPasswordDialog(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error("Gagal Mengubah Password", {
        description:
          error.message || "Terjadi kesalahan saat mengubah password.",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  function handleToggleDarkMode() {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    toast.success(`Mode ${newDarkMode ? "Gelap" : "Terang"} Diaktifkan`);
  }

  function handleToggleEmailNotifications() {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    localStorage.setItem("emailNotifications", String(newValue));
    toast.success(
      `Notifikasi Email ${newValue ? "Diaktifkan" : "Dinonaktifkan"}`
    );
  }

  function handleTogglePushNotifications() {
    const newValue = !pushNotifications;
    setPushNotifications(newValue);
    localStorage.setItem("pushNotifications", String(newValue));
    toast.success(
      `Notifikasi Push ${newValue ? "Diaktifkan" : "Dinonaktifkan"}`
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 bg-white min-h-screen">
        <Skeleton className="h-10 w-64 bg-gray-200" />
        <Skeleton className="h-96 w-full bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-white min-h-screen text-black">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black mb-2 tracking-tight">Pengaturan</h1>
        <p className="text-gray-600 font-medium">
          Kelola profil dan preferensi akun Anda
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 border-2 border-black p-1 h-auto">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold py-2"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold py-2"
          >
            <Lock className="w-4 h-4 mr-2" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-black data-[state=active]:text-white font-bold py-2"
          >
            <Bell className="w-4 h-4 mr-2" />
            Preferensi
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          {/* Avatar Section */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-black">Foto Profil</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Upload foto profil Anda untuk personalisasi akun
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                userName={name || "User"}
                onAvatarChange={handleAvatarChange}
              />
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-black">Informasi Pribadi</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Perbarui informasi pribadi Anda di sini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold">
                  Nama Lengkap <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 border-2 border-black font-medium focus-visible:ring-0"
                    required
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 font-bold">
                  Email
                  {user?.email_confirmed_at && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full border border-green-600">
                      <CheckCircle2 className="w-3 h-3" />
                      Terverifikasi
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 bg-gray-100 border-2 border-black font-medium text-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Email tidak dapat diubah
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 border-2 border-black font-medium focus-visible:ring-0"
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Format: 08xxxxxxxxxx atau +62xxxxxxxxxx
                </p>
              </div>

              <Separator className="bg-gray-200" />

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="font-bold">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Ceritakan sedikit tentang diri Anda..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
                <p className="text-xs text-gray-500 font-medium text-right">
                  {bio.length}/500 karakter
                </p>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="font-bold">Tanggal Lahir</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="pl-10 border-2 border-black font-medium focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="font-bold">Jenis Kelamin</Label>
                <Select
                  value={gender}
                  onValueChange={(value: "male" | "female" | "other") =>
                    setGender(value)
                  }
                >
                  <SelectTrigger id="gender" className="border-2 border-black font-medium focus:ring-0">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black">
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-gray-200" />

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          {/* Password */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-black">Password</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Kelola password akun Anda untuk keamanan yang lebih baik
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between p-4 border-2 border-black rounded-lg bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-black text-white rounded-lg border-2 border-black">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Ubah Password</h4>
                    <p className="text-sm text-gray-600 font-medium">
                      Pastikan password Anda kuat dan unik
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      Minimal 6 karakter
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowPasswordDialog(true)}
                  className="bg-white text-black border-2 border-black font-bold hover:bg-gray-100"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Ubah
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Security Info */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-black">Informasi Keamanan</CardTitle>
              <CardDescription className="text-gray-600 font-medium">Status keamanan akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Verification */}
              <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg border-2 ${user?.email_confirmed_at
                        ? "bg-green-100 border-green-600 text-green-700"
                        : "bg-orange-100 border-orange-600 text-orange-700"
                      }`}
                  >
                    {user?.email_confirmed_at ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Verifikasi Email</h4>
                    <p className="text-sm text-gray-600 font-medium">
                      {user?.email_confirmed_at
                        ? "Email Anda telah terverifikasi"
                        : "Email belum terverifikasi"}
                    </p>
                  </div>
                </div>
                {user?.email_confirmed_at && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>

              {/* Account Created */}
              <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 border-2 border-blue-600 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Akun Dibuat</h4>
                    <p className="text-sm text-gray-600 font-medium">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6 mt-6">
          {/* Appearance */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-black">Tampilan</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Sesuaikan tampilan aplikasi sesuai preferensi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-white rounded-lg border-2 border-black">
                    {darkMode ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Mode Gelap</h4>
                    <p className="text-sm text-gray-600 font-medium">
                      {darkMode
                        ? "Tampilan gelap untuk kenyamanan mata"
                        : "Tampilan terang untuk visibilitas lebih baik"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={handleToggleDarkMode}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200 border-2 border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-black">Notifikasi</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Kelola preferensi notifikasi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-white rounded-lg border-2 border-black">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Notifikasi Email</h4>
                    <p className="text-sm text-gray-600 font-medium">
                      Terima update dan pengingat via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={handleToggleEmailNotifications}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200 border-2 border-black"
                />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-white rounded-lg border-2 border-black">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Notifikasi Push</h4>
                    <p className="text-sm text-gray-600 font-medium">
                      Terima notifikasi real-time di browser
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={handleTogglePushNotifications}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200 border-2 border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-black">Data & Privasi</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Informasi tentang data dan privasi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border-2 border-black rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 font-medium">
                  Data Anda disimpan dengan aman dan tidak akan dibagikan kepada
                  pihak ketiga tanpa izin Anda. Kami menggunakan enkripsi
                  end-to-end untuk melindungi informasi pribadi Anda.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="font-black">Ubah Password</DialogTitle>
            <DialogDescription className="text-gray-600 font-medium">
              Masukkan password baru Anda. Password minimal 6 karakter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-bold">
                Password Baru
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border-2 border-black font-medium focus-visible:ring-0"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-bold">
                Konfirmasi Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-2 border-black font-medium focus-visible:ring-0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={changingPassword}
              className="border-2 border-black font-bold hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="bg-black text-white border-2 border-black font-bold hover:bg-gray-800"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengubah...
                </>
              ) : (
                "Ubah Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
