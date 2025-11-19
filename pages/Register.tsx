import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  User,
  Lock,
  Loader2,
  Phone,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");
  const navigate = useNavigate();

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return "weak";
    if (strength <= 4) return "medium";
    return "strong";
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const getPasswordRequirements = () => {
    return [
      { label: "Minimal 8 karakter", met: password.length >= 8 },
      { label: "Huruf besar (A-Z)", met: /[A-Z]/.test(password) },
      { label: "Huruf kecil (a-z)", met: /[a-z]/.test(password) },
      { label: "Angka (0-9)", met: /[0-9]/.test(password) },
      { label: "Simbol (!@#$%^&*)", met: /[^a-zA-Z0-9]/.test(password) },
    ];
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Nama lengkap harus diisi");
      return false;
    }
    if (!email.trim()) {
      setError("Email harus diisi");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid");
      return false;
    }
    if (!password) {
      setError("Password harus diisi");
      return false;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password harus mengandung huruf besar");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password harus mengandung huruf kecil");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password harus mengandung angka");
      return false;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError("Password harus mengandung simbol (!@#$%^&*)");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return false;
    }
    if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
      setError("Format nomor telepon tidak valid");
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    setError("");
    if (!validateForm()) return;

    try {
      setLoading(true);
      console.log("📝 Sending OTP to:", email);

      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (existingUser) {
        setError("Email sudah terdaftar. Silakan login.");
        return;
      }

      const { error: otpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            name: name.trim(),
            phone: phone.trim() || null,
          },
        },
      });

      if (otpError) throw otpError;

      console.log("✅ OTP sent to email");
      setStep("verify");
      toast.success("Kode OTP Terkirim!", {
        description: `Silakan cek email ${email} untuk kode verifikasi.`,
      });
    } catch (error: any) {
      console.error("❌ Send OTP error:", error);
      setError(error.message || "Gagal mengirim OTP. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }

    try {
      setLoading(true);
      console.log("🔐 Verifying OTP...");

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.toLowerCase(),
        token: otp,
        type: "signup",
      });

      if (verifyError) throw verifyError;

      console.log("✅ OTP verified, user registered");
      toast.success("Registrasi Berhasil!", {
        description: "Akun Anda telah dibuat. Silakan login.",
      });
      navigate("/login");
    } catch (error: any) {
      console.error("❌ Verify OTP error:", error);
      setError(error.message || "Kode OTP tidak valid. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-y-auto">
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
          className="max-w-md mx-auto w-full py-10"
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              {step === "form" ? "Buat Akun Baru" : "Verifikasi Email"}
            </h1>
            <p className="text-muted-foreground">
              {step === "form"
                ? "Daftar untuk memulai tryout online"
                : `Masukkan kode OTP yang dikirim ke ${email}`}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6"
            >
              <p className="text-sm text-destructive font-medium">{error}</p>
            </motion.div>
          )}

          {step === "form" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                    disabled={loading}
                  />
                </div>
              </div>

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
                    className="pl-10 h-11 rounded-xl"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                    disabled={loading}
                  />
                </div>

                {password && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-300",
                            passwordStrength === "weak" && "w-1/3 bg-red-500",
                            passwordStrength === "medium" &&
                            "w-2/3 bg-yellow-500",
                            passwordStrength === "strong" &&
                            "w-full bg-green-500"
                          )}
                        />
                      </div>
                      <span className="text-xs font-medium min-w-[50px] text-right">
                        {passwordStrength === "weak" && "Lemah"}
                        {passwordStrength === "medium" && "Sedang"}
                        {passwordStrength === "strong" && "Kuat"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {getPasswordRequirements().map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                        >
                          {req.met ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span
                            className={cn(
                              req.met
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                className="w-full h-12 rounded-xl text-base font-medium mt-4"
                onClick={handleSendOTP}
                disabled={loading || passwordStrength === "weak"}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim OTP...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-bold"
                >
                  Masuk
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Kode OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="text-center text-3xl tracking-[1em] h-16 font-bold rounded-xl"
                  disabled={loading}
                  autoFocus
                />
                <p className="text-sm text-muted-foreground text-center">
                  Kode OTP telah dikirim ke <strong>{email}</strong>
                </p>
              </div>

              <Button
                className="w-full h-12 rounded-xl text-base font-medium"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi & Daftar"
                )}
              </Button>

              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Kembali ke Form
                </Button>

                <Button
                  variant="link"
                  className="w-full"
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  Kirim Ulang OTP
                </Button>
              </div>
            </div>
          )}
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
                Bergabung dengan Komunitas Belajar Terbaik
              </h2>
              <p className="text-lg text-background/80 leading-relaxed">
                Dapatkan akses ke ribuan soal berkualitas, analisis mendalam, dan
                komunitas yang suportif.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
