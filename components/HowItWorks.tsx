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
    <section id="how-it-works" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Cara Kerja TryoutKan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hanya 3 langkah mudah untuk memulai perjalanan suksesmu
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="mb-6 relative inline-block">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <step.icon className="text-primary" size={32} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {step.step}
                    </span>
                  </div>
                </div>

                {/* Timeline illustration */}
                <div className="text-6xl mb-4">{step.illustration}</div>

                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button size="lg" className="text-lg px-8" asChild>
            <a href="/register">
              Mulai dari Langkah Pertama <Rocket className="ml-2" size={20} />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
