import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email harus diisi");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    try {
      setLoading(true);

      console.log("🔑 Sending password reset email to:", email);

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) throw resetError;

      console.log("✅ Password reset email sent");

      setSuccess(true);
    } catch (error: any) {
      console.error("❌ Reset password error:", error);
      setError(error.message || "Gagal mengirim email reset password.");
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
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                Lupa Password?
              </CardTitle>
              <CardDescription>
                Masukkan email Anda dan kami akan mengirimkan link untuk reset
                password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!success ? (
                <>
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-800 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Alamat Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleResetPassword()
                        }
                        className="pl-10"
                        disabled={loading}
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
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Link Reset Password"
                    )}
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Kembali ke halaman login
                    </Link>
                  </div>
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
                        Email Terkirim!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Kami telah mengirimkan link reset password ke{" "}
                        <strong>{email}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Silakan cek inbox email Anda dan klik link untuk reset
                        password.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSuccess(false);
                        setEmail("");
                      }}
                    >
                      Kirim Ulang Email
                    </Button>
                    <Link to="/login" className="block">
                      <Button variant="ghost" className="w-full">
                        Kembali ke Login
                      </Button>
                    </Link>
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

