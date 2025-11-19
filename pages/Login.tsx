import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
        // Check for network/DNS errors
        if (
          signInError.message.includes("fetch") ||
          signInError.message.includes("network") ||
          signInError.message.includes("ERR_NAME_NOT_RESOLVED")
        ) {
          setError(
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba lagi nanti."
          );
        } else if (signInError.message.includes("Invalid login credentials")) {
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
        description: `Selamat datang kembali${userRole === "admin" ? ", Admin" : ""
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
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
        <Link
          to="/"
          className="absolute top-8 left-8 md:left-12 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto w-full"
        >
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-muted-foreground">
              Masuk ke akun Anda untuk melanjutkan belajar
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6"
            >
              <p className="text-sm text-destructive font-medium">{error}</p>
            </motion.div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="pl-10 h-12 rounded-xl"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
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
                  className="pl-10 h-12 rounded-xl"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              className="w-full h-12 rounded-xl text-base font-medium"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                "Masuk Sekarang"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-bold"
              >
                Daftar Gratis
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Image/Pattern */}
      <div className="hidden lg:block w-1/2 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Mulai Perjalanan Suksesmu Hari Ini
              </h2>
              <p className="text-lg text-background/80 leading-relaxed">
                Bergabunglah dengan ribuan peserta lain yang telah berhasil lolos
                ujian CPNS & BUMN bersama TryoutKan.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
