import {
  BookOpen,
  BarChart3,
  Clock,
  Users,
  Award,
  Smartphone,
  Brain,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BookOpen,
    title: "Bank Soal Lengkap",
    description:
      "Ribuan soal dari berbagai kategori ujian dengan tingkat kesulitan bervariasi",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: BarChart3,
    title: "Analisis Mendalam",
    description:
      "Dapatkan insight tentang kekuatan dan kelemahanmu dengan grafik yang detail",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Clock,
    title: "Sistem Timer Real-time",
    description:
      "Simulasi ujian sesungguhnya dengan timer yang akurat untuk setiap soal",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Users,
    title: "Ranking Nasional",
    description:
      "Bandingkan hasil tryoutmu dengan peserta lain di seluruh Indonesia",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: Award,
    title: "Pembahasan Expert",
    description:
      "Setiap soal dilengkapi pembahasan detail dari para ahli di bidangnya",
    color: "bg-red-500/10 text-red-600",
  },
  {
    icon: Smartphone,
    title: "Akses Multi-platform",
    description:
      "Belajar kapan saja, dimana saja melalui website atau aplikasi mobile",
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    icon: Brain,
    title: "Analisis AI Otomatis",
    description:
      "Lihat kekuatan & kelemahanmu secara cerdas dengan teknologi AI terkini",
    color: "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600",
    featured: true,
  },
  {
    icon: Target,
    title: "Simulasi Mirip Asli",
    description:
      "Tampilan & waktu sesuai ujian sebenarnya untuk persiapan maksimal",
    color: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600",
    featured: true,
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-12 md:py-20 px-4 bg-muted/30 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="text-primary" size={16} />
            <span className="text-primary font-medium text-sm">
              Fitur Terbaik untuk Suksesmu
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
            Fitur Unggulan Kami
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Semua yang kamu butuhkan untuk persiapan ujian yang maksimal
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full group ${
                feature.featured
                  ? "ring-2 ring-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 hover:scale-105 lg:col-span-2"
                  : "hover:scale-102"
              }`}
            >
              <CardContent className="pt-6 md:pt-8 pb-6 relative overflow-hidden">
                {/* Featured badge */}
                {feature.featured && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-gradient-to-r from-primary to-secondary text-white text-xs px-2 py-1 rounded-full font-medium">
                      Premium
                    </div>
                  </div>
                )}

                <div
                  className={`w-12 h-12 md:w-14 md:h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="hidden md:block" size={28} />
                  <feature.icon className="md:hidden" size={24} />
                </div>

                <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-primary hover:text-primary/80 group-hover:translate-x-1 transition-all duration-300"
                    asChild
                  >
                    <a href="/register" className="flex items-center gap-1">
                      Coba Fitur Ini
                      <ArrowRight size={16} />
                    </a>
                  </Button>

                  {feature.featured && (
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 bg-primary/20 rounded-full border-2 border-background"></div>
                      <div className="w-6 h-6 bg-secondary/20 rounded-full border-2 border-background"></div>
                      <div className="w-6 h-6 bg-accent/20 rounded-full border-2 border-background"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Siap Mencoba Semua Fitur Ini?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan peserta lain yang telah merasakan
              manfaatnya
            </p>
            <Button size="lg" className="px-8" asChild>
              <a href="/register">
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2" size={20} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
