import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const counters = {
    users: 50000,
    questions: 10000,
    satisfaction: 95,
  };

  return (
    <section id="hero" className="relative bg-black text-white pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full animate-fade-in">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/90 font-medium text-sm">
              Platform Tryout Online Terpercaya
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
            <span className="block text-white animate-fade-in-delay">Raih Kesuksesanmu</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 animate-fade-in-delay-2">
              Dimulai Di Sini
            </span>
          </h1>

          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto animate-fade-in-delay-3">
            Platform tryout online dengan teknologi AI untuk analisis performa mendalam,
            pembahasan lengkap, dan simulasi ujian yang akurat untuk persiapan CPNS & BUMN.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-delay-4">
            <Button
              size="lg"
              className="text-lg font-semibold px-8 py-4 w-full sm:w-auto bg-white text-black hover:bg-gray-200 transform hover:scale-105 transition-all duration-300"
              asChild
            >
              <a href="/register">
                Mulai Tryout Gratis
                <ArrowRight className="ml-2 size={20} hover:translate-x-1 transition-transform duration-300" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 animate-fade-in-delay-5">
              <div className="text-3xl font-bold text-white mb-2">
                {counters.users > 1000
                  ? `${(counters.users / 1000).toFixed(0)}K+`
                  : counters.users.toLocaleString("id-ID")}
              </div>
              <div className="text-sm text-gray-400">Pengguna Aktif</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 animate-fade-in-delay-6">
              <div className="text-3xl font-bold text-white mb-2">
                {counters.questions > 1000
                  ? `${(counters.questions / 1000).toFixed(0)}K+`
                  : counters.questions.toLocaleString("id-ID")}
              </div>
              <div className="text-sm text-gray-400">Soal Berkualitas</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 animate-fade-in-delay-7">
              <div className="text-3xl font-bold text-white mb-2">
                {counters.satisfaction}%
              </div>
              <div className="text-sm text-gray-400">Tingkat Kepuasan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background animated elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-white/3 rounded-full blur-2xl animate-float-delay"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/4 rounded-full blur-xl animate-float-delay-2"></div>
      </div>
    </section>
  );
}