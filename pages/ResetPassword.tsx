import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle, Check, X } from "lucide-react";
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

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user came from reset password email link
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setValidToken(true);
      } else {
        setError("Link reset password tidak valid atau sudah kadaluarsa.");
      }
    };

    checkSession();
  }, []);

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

  const handleResetPassword = async () => {
    setError("");

    if (!password) {
      setError("Password harus diisi");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    // Check all password requirements
    if (!/[A-Z]/.test(password)) {
      setError("Password harus mengandung huruf besar");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password harus mengandung huruf kecil");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password harus mengandung angka");
      return;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError("Password harus mengandung simbol (!@#$%^&*)");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    try {
      setLoading(true);

      console.log("🔑 Updating password...");

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      console.log("✅ Password updated successfully");

      setSuccess(true);

      // Show success toast
      toast.success("Password Berhasil Diubah!", {
        description: "Silakan login dengan password baru Anda.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("❌ Reset password error:", error);
      setError(error.message || "Gagal mengubah password.");
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
            <Link to="/login">
              <Button variant="ghost">Kembali ke Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                Reset Password
              </CardTitle>
              <CardDescription>
                Masukkan password baru untuk akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!validToken ? (
                <>
                  {/* Invalid Token Message */}
                  <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-400 text-center">
                      {error ||
                        "Link reset password tidak valid atau sudah kadaluarsa."}
                    </p>
                  </div>
                  <Link to="/forgot-password" className="block">
                    <Button variant="outline" className="w-full">
                      Kirim Ulang Link Reset Password
                    </Button>
                  </Link>
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      Kembali ke Login
                    </Button>
                  </Link>
                </>
              ) : !success ? (
                <>
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-800 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password Baru <span className="text-destructive">*</span>
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
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <X className="w-3 h-3 text-gray-400" />
                              )}
                              <span
                                className={cn(
                                  req.met
                                    ? "text-green-600 dark:text-green-400"
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

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Konfirmasi Password Baru{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleResetPassword()
                        }
                        className="pl-10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengubah Password...
                      </>
                    ) : (
                      "Ubah Password"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {/* Success Message */}
                  <div className="text-center space-y-4 py-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        Password Berhasil Diubah!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Password Anda telah berhasil diubah.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Anda akan diarahkan ke halaman login dalam 3 detik...
                      </p>
                    </div>
                  </div>

                  <Link to="/login" className="block">
                    <Button className="w-full">Login Sekarang</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
