import { UserPlus, ClipboardCheck, TrendingUp, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: UserPlus,
    title: "Buat Akun dalam 1 Menit",
    description:
      "Daftar gratis dengan email atau akun sosial media. Tidak perlu kartu kredit.",
    step: "01",
    illustration: "👤",
  },
  {
    icon: ClipboardCheck,
    title: "Kerjakan Simulasi Real-Time",
    description:
      "Pilih tryout CPNS atau BUMN dan kerjakan dengan timer yang akurat seperti ujian sungguhan.",
    step: "02",
    illustration: "📝",
  },
  {
    icon: TrendingUp,
    title: "Lihat Skor & Pembahasan Instan",
    description:
      "Dapatkan analisis mendalam, pembahasan lengkap, dan rekomendasi untuk perbaikan.",
    step: "03",
    illustration: "📊",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-black text-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
            <span className="text-white text-sm font-medium">Proses</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            <span className="block text-white">Cara Kerja</span>
            <span className="block text-gray-400">TryoutKan</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Hanya 3 langkah mudah untuk memulai perjalanan suksesmu
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                <div className="text-center">
                  <div className="mb-6 relative inline-block">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto transition-all duration-300">
                      <step.icon className="text-white" size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">
                        {step.step}
                      </span>
                    </div>
                  </div>

                  {/* Timeline illustration */}
                  <div className="text-6xl mb-4">
                    {step.illustration}
                  </div>

                  <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white group-hover:text-gray-200 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 left-[60%] w-[80%] h-0.5 bg-white/20 overflow-hidden">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button size="lg" className="text-lg px-8 bg-white text-black hover:bg-gray-200 transition-all duration-300 hover:scale-105" asChild>
            <a href="/register">
              Mulai dari Langkah Pertama
              <Rocket className="ml-2" size={20} />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
