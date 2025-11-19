import { UserPlus, ClipboardCheck, TrendingUp, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: UserPlus,
    title: "Buat Akun dalam 1 Menit",
    description:
      "Daftar gratis dengan email atau akun sosial media. Tidak perlu kartu kredit.",
    step: "01",
  },
  {
    icon: ClipboardCheck,
    title: "Kerjakan Simulasi Real-Time",
    description:
      "Pilih tryout CPNS atau BUMN dan kerjakan dengan timer yang akurat seperti ujian sungguhan.",
    step: "02",
  },
  {
    icon: TrendingUp,
    title: "Lihat Skor & Pembahasan Instan",
    description:
      "Dapatkan analisis mendalam, pembahasan lengkap, dan rekomendasi untuk perbaikan.",
    step: "03",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Cara Kerja TryoutKan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Hanya 3 langkah mudah untuk memulai perjalanan suksesmu
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto mb-20">
          {/* Connecting Line */}
          <div className="absolute top-12 left-0 w-full h-0.5 bg-border hidden md:block" />

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center relative z-10">
                  <div className="mb-8 relative inline-block group">
                    <div className="w-24 h-24 bg-background border-4 border-border rounded-full flex items-center justify-center mx-auto transition-colors duration-300 group-hover:border-foreground">
                      <step.icon
                        className="text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                        size={32}
                      />
                    </div>
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed px-4">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <Link to="/register">
            <Button
              size="lg"
              className="text-lg px-10 h-14 rounded-full hover:scale-105 transition-transform"
            >
              Mulai dari Langkah Pertama <Rocket className="ml-2" size={20} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
