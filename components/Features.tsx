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
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const features = [
  {
    icon: BookOpen,
    title: "Bank Soal Lengkap",
    description:
      "Ribuan soal dari berbagai kategori ujian dengan tingkat kesulitan bervariasi",
  },
  {
    icon: BarChart3,
    title: "Analisis Mendalam",
    description:
      "Dapatkan insight tentang kekuatan dan kelemahanmu dengan grafik yang detail",
  },
  {
    icon: Clock,
    title: "Sistem Timer Real-time",
    description:
      "Simulasi ujian sesungguhnya dengan timer yang akurat untuk setiap soal",
  },
  {
    icon: Users,
    title: "Ranking Nasional",
    description:
      "Bandingkan hasil tryoutmu dengan peserta lain di seluruh Indonesia",
  },
  {
    icon: Award,
    title: "Pembahasan Expert",
    description:
      "Setiap soal dilengkapi pembahasan detail dari para ahli di bidangnya",
  },
  {
    icon: Smartphone,
    title: "Akses Multi-platform",
    description:
      "Belajar kapan saja, dimana saja melalui website atau aplikasi mobile",
  },
  {
    icon: Brain,
    title: "Analisis AI Otomatis",
    description:
      "Lihat kekuatan & kelemahanmu secara cerdas dengan teknologi AI terkini",
    featured: true,
  },
  {
    icon: Target,
    title: "Simulasi Mirip Asli",
    description:
      "Tampilan & waktu sesuai ujian sebenarnya untuk persiapan maksimal",
    featured: true,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section
      id="features"
      className="py-20 px-4 bg-background relative overflow-hidden"
    >
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-full mb-6 border border-foreground/10"
          >
            <Sparkles className="text-foreground" size={16} />
            <span className="text-foreground font-medium text-sm">
              Fitur Terbaik untuk Suksesmu
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
          >
            Fitur Unggulan Kami
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Semua yang kamu butuhkan untuk persiapan ujian yang maksimal
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item} className="h-full">
              <Card
                className={`h-full border-border hover:border-foreground/20 transition-all duration-300 hover:shadow-lg group bg-card ${feature.featured ? "ring-1 ring-foreground/10" : ""
                  }`}
              >
                <CardContent className="pt-8 pb-8 px-6 relative overflow-hidden h-full flex flex-col">
                  {feature.featured && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-foreground text-background text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                        Premium
                      </div>
                    </div>
                  )}

                  <div className="w-14 h-14 bg-foreground/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-foreground group-hover:text-background">
                    <feature.icon size={28} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:translate-x-1 transition-transform duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground mb-6 leading-relaxed flex-grow">
                    {feature.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <Link to="/register">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-transparent hover:text-foreground group-hover:translate-x-1 transition-all duration-300 font-medium"
                      >
                        Coba Fitur Ini
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20 text-center"
        >
          <div className="bg-foreground text-background rounded-3xl p-10 md:p-16 max-w-5xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Siap Mencoba Semua Fitur Ini?
              </h3>
              <p className="text-background/80 mb-8 max-w-2xl mx-auto text-lg">
                Bergabunglah dengan ribuan peserta lain yang telah merasakan
                manfaatnya
              </p>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-10 h-14 text-lg rounded-full hover:scale-105 transition-transform"
                >
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
