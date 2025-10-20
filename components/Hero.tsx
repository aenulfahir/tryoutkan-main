import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Shield, Brain } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [counters, setCounters] = useState({
    users: 0,
    questions: 0,
    satisfaction: 0,
  });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const targetValues = {
      users: 50000,
      questions: 10000,
      satisfaction: 95,
    };

    const duration = 2000; // 2 seconds
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

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 relative overflow-hidden">
      {/* Background parallax effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      ></div>

      {/* Floating elements for parallax */}
      <div
        className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl -z-10"
        style={{
          transform: `translateY(${scrollY * 0.3}px) translateX(${
            scrollY * 0.1
          }px)`,
        }}
      ></div>
      <div
        className="absolute top-40 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -z-10"
        style={{
          transform: `translateY(${scrollY * 0.2}px) translateX(${
            -scrollY * 0.1
          }px)`,
        }}
      ></div>
      <div
        className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary/5 rounded-full blur-lg -z-10"
        style={{
          transform: `translateY(${scrollY * 0.4}px)`,
        }}
      ></div>

      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-3 md:px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-primary font-medium text-xs md:text-sm">
              Platform Tryout Online Terpercaya
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            Persiapkan Dirimu untuk <span className="text-primary">Sukses</span>{" "}
            di Ujian
          </h1>

          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Latihan tryout interaktif dengan analisis pintar dan pembahasan
            lengkap untuk bantu kamu lolos CPNS & BUMN.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-6 md:mb-8 px-4">
            <Button
              size="lg"
              className="text-sm md:text-lg px-6 md:px-8 w-full sm:w-auto bg-green-600 hover:bg-green-700"
              asChild
            >
              <a href="/register">
                Coba Sekarang Gratis
                <ArrowRight className="ml-2 hidden sm:block" size={20} />
                <ArrowRight className="ml-2 sm:hidden" size={16} />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-sm md:text-lg px-6 md:px-8 w-full sm:w-auto"
              asChild
            >
              <a href="#demo">
                <Play className="mr-2 hidden sm:block" size={20} />
                <Play className="mr-2 sm:hidden" size={16} />
                Lihat Demo
              </a>
            </Button>
          </div>

          {/* Trust Elements */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-8 md:mb-12 px-4 text-sm md:text-base text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500 fill-yellow-500" size={16} />
              <span>
                Dipercaya oleh {counters.users.toLocaleString("id-ID")}+ peserta
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="text-green-600" size={16} />
              <span>Aman & resmi</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="text-blue-600" size={16} />
              <span>Pembahasan oleh expert</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-6 md:pt-8 border-t border-border px-4">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {counters.users > 1000
                  ? `${(counters.users / 1000).toFixed(0)}K+`
                  : counters.users.toLocaleString("id-ID")}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Pengguna Aktif
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {counters.questions > 1000
                  ? `${(counters.questions / 1000).toFixed(0)}K+`
                  : counters.questions.toLocaleString("id-ID")}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Soal Berkualitas
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {counters.satisfaction}%
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Tingkat Kepuasan
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
