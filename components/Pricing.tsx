import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";

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
    <section id="pricing" className="py-12 md:py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
            Pilih Paket Tryout
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Investasi terbaik untuk masa depanmu dengan harga terjangkau
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-xl scale-100 md:scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                    Paling Populer
                  </span>
                </div>
              )}
              <CardHeader className="text-center pt-6 md:pt-8">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm mb-4 px-2">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-3xl md:text-5xl font-bold">
                    Rp {plan.price}
                  </span>
                  <span className="text-sm md:text-base text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full mb-4 md:mb-6 text-sm md:text-base"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <a href="/register">{plan.cta}</a>
                </Button>
                <ul className="space-y-2 md:space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check
                        className="text-primary mr-2 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <span className="text-xs md:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Info:</strong> Semua paket include akses selamanya dan
            bisa diakses di semua perangkat
          </p>
        </div>
      </div>
    </section>
  );
}
