import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Shield, Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Hero() {
  const [counters, setCounters] = useState({
    users: 0,
    questions: 0,
    satisfaction: 0,
  });

  useEffect(() => {
    const targetValues = {
      users: 50000,
      questions: 10000,
      satisfaction: 95,
    };

    const duration = 2000;
    const steps = 50;
    const increment = {
      users: targetValues.users / steps,
      questions: targetValues.questions / steps,
      satisfaction: targetValues.satisfaction / steps,
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCounters(targetValues);
        clearInterval(timer);
      } else {
        setCounters({
          users: Math.floor(increment.users * currentStep),
          questions: Math.floor(increment.questions * currentStep),
          satisfaction: Math.floor(increment.satisfaction * currentStep),
        });
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden min-h-screen flex items-center bg-background">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05),transparent_50%)]" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-foreground/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 px-4 py-1.5 bg-foreground/5 rounded-full border border-foreground/10"
          >
            <span className="text-foreground/80 font-medium text-sm flex items-center gap-2">
              <Star className="w-4 h-4 fill-foreground/20" />
              Platform Tryout Online Terpercaya
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight"
          >
            Persiapkan Dirimu untuk <br />
            <span className="relative inline-block">
              <span className="relative z-10">Sukses</span>
              <motion.span
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute bottom-2 left-0 h-4 bg-foreground/10 -z-0 -rotate-2"
              />
            </span>{" "}
            di Ujian
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Latihan tryout interaktif dengan analisis pintar dan pembahasan
            lengkap untuk bantu kamu lolos CPNS & BUMN.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link to="/register">
              <Button
                size="lg"
                className="text-lg px-8 h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105"
              >
                Coba Sekarang Gratis
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 rounded-full border-2 hover:bg-accent transition-all hover:scale-105"
              >
                <Play className="mr-2" size={20} />
                Lihat Demo
              </Button>
            </a>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-10 border-t border-border"
          >
            <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-accent/50 transition-colors">
              <div className="text-4xl font-bold mb-2 tabular-nums tracking-tight">
                {counters.users > 1000
                  ? `${(counters.users / 1000).toFixed(0)}K+`
                  : counters.users.toLocaleString("id-ID")}
              </div>
              <div className="text-muted-foreground font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Pengguna Aktif
              </div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-accent/50 transition-colors">
              <div className="text-4xl font-bold mb-2 tabular-nums tracking-tight">
                {counters.questions > 1000
                  ? `${(counters.questions / 1000).toFixed(0)}K+`
                  : counters.questions.toLocaleString("id-ID")}
              </div>
              <div className="text-muted-foreground font-medium flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Soal Berkualitas
              </div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-accent/50 transition-colors">
              <div className="text-4xl font-bold mb-2 tabular-nums tracking-tight">
                {counters.satisfaction}%
              </div>
              <div className="text-muted-foreground font-medium flex items-center gap-2">
                <Star className="w-4 h-4" />
                Tingkat Kepuasan
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
