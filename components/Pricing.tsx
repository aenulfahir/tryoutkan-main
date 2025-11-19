import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Paket CPNS",
    price: "49.000",
    period: "per paket",
    description: "Persiapan lengkap untuk tes CPNS",
    features: [
      "10 tryout CPNS lengkap",
      "Pembahasan detail setiap soal",
      "Analisis performa per materi",
      "Simulasi tes CAT resmi",
      "Akses selamanya",
    ],
    cta: "Beli Sekarang",
    popular: true,
  },
  {
    name: "Paket BUMN",
    price: "39.000",
    period: "per paket",
    description: "Khusus persiapan tes BUMN",
    features: [
      "8 tryout BUMN lengkap",
      "Pembahasan detail setiap soal",
      "Analisis performa per materi",
      "Simulasi tes online",
      "Akses selamanya",
    ],
    cta: "Beli Sekarang",
    popular: false,
  },
  {
    name: "Paket Combo",
    price: "79.000",
    period: "per paket",
    description: "CPNS + BUMN hemat 20%",
    features: [
      "Semua tryout CPNS & BUMN",
      "Pembahasan detail semua soal",
      "Analisis performa lengkap",
      "Simulasi semua jenis tes",
      "Akses selamanya",
      "Bonus: Tips & trik lulus tes",
    ],
    cta: "Beli Sekarang",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-muted/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-foreground/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Pilih Paket Tryout
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Investasi terbaik untuk masa depanmu dengan harga terjangkau
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`relative h-full flex flex-col transition-all duration-300 hover:shadow-xl ${plan.popular
                    ? "border-foreground shadow-lg scale-105 z-10"
                    : "border-border hover:border-foreground/50"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-foreground text-background px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Sparkles size={14} />
                      Paling Populer
                    </div>
                  </div>
                )}
                <CardHeader className="text-center pt-10 pb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Rp
                    </span>
                    <span className="text-5xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    /{plan.period}
                  </span>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="w-full">
                    <Button
                      className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-300 ${plan.popular
                          ? "bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-lg"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground bg-background/50 inline-block px-4 py-2 rounded-full border border-border">
            💡 <strong>Info:</strong> Semua paket include akses selamanya dan bisa
            diakses di semua perangkat
          </p>
        </motion.div>
      </div>
    </section>
  );
}
