import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email harus diisi");
      return;
    }

    if (!password) {
      setError("Password harus diisi");
      return;
    }

    try {
      setLoading(true);

      console.log("🔐 Logging in user:", email);

      // 1. Sign in with email and password
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password: password,
        });

      if (signInError) {
        // Check if user doesn't exist
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email atau password salah. Silakan coba lagi.");
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (!data.user) {
        setError("Gagal login. Silakan coba lagi.");
        return;
      }

      console.log("✅ User logged in:", data.user.id);

      // 2. Fetch user role from profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("❌ Error fetching profile:", profileError);
        setError("Gagal memuat profil. Silakan coba lagi.");
        return;
      }

      const userRole = profileData?.role || "user";
      console.log("👤 User role:", userRole);

      // 3. Show success message
      toast.success("Login Berhasil!", {
        description: `Selamat datang kembali${
          userRole === "admin" ? ", Admin" : ""
        }!`,
      });

      // 4. Redirect based on role
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      setError(error.message || "Gagal login. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">
                  T
                </span>
              </div>
              <span className="text-2xl font-bold">TryoutKan</span>
            </Link>
            <Link to="/">
              <Button variant="ghost">Kembali ke Beranda</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-20 md:pt-24 pb-8 md:pb-12 px-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl font-bold">
                Selamat Datang Kembali
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Masuk ke akun Anda untuk melanjutkan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-xs md:text-sm text-red-800 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm md:text-base">
                  Alamat Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="pl-10 text-sm md:text-base"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm md:text-base">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs md:text-sm text-primary hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="pl-10 text-sm md:text-base"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                className="w-full text-sm md:text-base"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>

              <p className="text-center text-xs md:text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Daftar
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
