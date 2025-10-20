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
  AlertCircle,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form"); // form or verify
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;

    // Check length
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;

    // Check for lowercase
    if (/[a-z]/.test(pwd)) strength++;

    // Check for uppercase
    if (/[A-Z]/.test(pwd)) strength++;

    // Check for numbers
    if (/[0-9]/.test(pwd)) strength++;

    // Check for symbols
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
      {
        label: "Minimal 8 karakter",
        met: password.length >= 8,
      },
      {
        label: "Huruf besar (A-Z)",
        met: /[A-Z]/.test(password),
      },
      {
        label: "Huruf kecil (a-z)",
        met: /[a-z]/.test(password),
      },
      {
        label: "Angka (0-9)",
        met: /[0-9]/.test(password),
      },
      {
        label: "Simbol (!@#$%^&*)",
        met: /[^a-zA-Z0-9]/.test(password),
      },
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

    // Check all password requirements
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

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      console.log("📝 Sending OTP to:", email);

      // 1. Check if user already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (existingUser) {
        setError("Email sudah terdaftar. Silakan login.");
        return;
      }

      // 2. Send OTP via Supabase
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

      // 3. Move to verification step
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

      // Verify OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.toLowerCase(),
        token: otp,
        type: "signup",
      });

      if (verifyError) throw verifyError;

      console.log("✅ OTP verified, user registered");

      // Show success message
      toast.success("Registrasi Berhasil!", {
        description: "Akun Anda telah dibuat. Silakan login.",
      });

      // Redirect to login
      navigate("/login");
    } catch (error: any) {
      console.error("❌ Verify OTP error:", error);
      setError(error.message || "Kode OTP tidak valid. Silakan coba lagi.");
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

      <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {step === "form" ? "Buat Akun Baru" : "Verifikasi Email"}
              </CardTitle>
              <CardDescription>
                {step === "form"
                  ? "Daftar untuk memulai tryout online"
                  : `Masukkan kode OTP yang dikirim ke ${email}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {step === "form" ? (
                <>
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nama Lengkap <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nama lengkap Anda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Alamat Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone (Optional) */}
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
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                        required
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-300",
                                passwordStrength === "weak" &&
                                  "w-1/3 bg-red-500",
                                passwordStrength === "medium" &&
                                  "w-2/3 bg-yellow-500",
                                passwordStrength === "strong" &&
                                  "w-full bg-green-500"
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              passwordStrength === "weak" && "text-red-500",
                              passwordStrength === "medium" &&
                                "text-yellow-500",
                              passwordStrength === "strong" && "text-green-500"
                            )}
                          >
                            {passwordStrength === "weak" && "Lemah"}
                            {passwordStrength === "medium" && "Sedang"}
                            {passwordStrength === "strong" && "Kuat"}
                          </span>
                        </div>

                        {/* Password Requirements */}
                        <div className="space-y-1">
                          {getPasswordRequirements().map((req, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-xs"
                            >
                              {req.met ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <XCircle className="w-3 h-3 text-gray-400" />
                              )}
                              <span
                                className={cn(
                                  req.met
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-500"
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

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Konfirmasi Password{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Ulangi password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
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
                      className="text-primary hover:underline font-medium"
                    >
                      Masuk
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  {/* OTP Verification Form */}
                  <div className="space-y-2">
                    <Label htmlFor="otp">Kode OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Masukkan 6 digit kode OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      disabled={loading}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Kode OTP telah dikirim ke <strong>{email}</strong>
                    </p>
                  </div>

                  <Button
                    className="w-full"
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

                  <div className="space-y-2">
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
                      variant="outline"
                      className="w-full"
                      onClick={handleSendOTP}
                      disabled={loading}
                    >
                      Kirim Ulang OTP
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
