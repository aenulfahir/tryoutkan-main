import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";

const plans = [
  {
    name: "Paket CPNS",
    price: "5.000",
    period: "per paket",
    description: "Persiapan lengkap untuk tes CPNS dengan harga terjangkau",
    features: [
      "1 paket CPNS lengkap",
      "Pembahasan soal detail",
      "Analisis performa soal",
      "Akses selamanya",
    ],
    cta: "Pilih Paket Ini",
    popular: false,
  },
  {
    name: "Paket BUMN",
    price: "10.000",
    period: "per paket",
    description: "Khusus persiapan tes BUMN dengan materi komprehensif",
    features: [
      "1 paket BUMN lengkap",
      "Pembahasan soal detail",
      "Analisis performa soal",
      "Akses selamanya",
    ],
    cta: "Pilih Paket Terbaik",
    popular: true,
  },
  {
    name: "Paket Kedinasan",
    price: "5.000",
    period: "per paket",
    description: "Fokus persiapan untuk masuk sekolah kedinasan terbaik",
    features: [
      "1 paket Kedinasan lengkap",
      "Pembahasan soal detail",
      "Analisis performa soal",
      "Akses selamanya",
    ],
    cta: "Pilih Paket Ini",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-black text-white rounded-full">
            <span className="text-sm font-medium">Harga Terbaik</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-black">
            Pilih Paket Tryout
            <br />
            <span className="text-xl md:text-2xl lg:text-3xl text-gray-600">Yang Sesuai Untukmu</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Investasi terbaik untuk masa depanmu dengan harga terjangkau dan fitur lengkap
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group ${
                plan.popular
                  ? "transform scale-105"
                  : "hover:scale-102"
              } transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-black text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>Paling Populer</span>
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`relative bg-white border-2 rounded-2xl p-6 shadow-lg overflow-hidden ${
                plan.popular ? "border-black" : "border-gray-200"
              }`}>

                {/* Content */}
                <div className="relative z-10">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg md:text-xl font-bold mb-2 text-black">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-xs md:text-sm">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl md:text-3xl font-bold text-black">
                          Rp {plan.price}
                        </span>
                        <span className="text-gray-500 text-sm">/{plan.period}</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full py-3 px-6 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${
                        plan.popular
                          ? "bg-black text-white hover:bg-gray-900"
                          : "bg-white text-black border-2 border-black hover:bg-gray-100"
                      }`}
                      asChild
                    >
                      <a href="/register">{plan.cta}</a>
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="border-t border-gray-200 pt-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                            plan.popular ? "bg-black" : "bg-gray-200"
                          }`}>
                            <Check
                              className={plan.popular ? "text-white" : "text-black"}
                              size={12}
                            />
                          </div>
                          <span className="text-gray-700 text-xs md:text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gray-100 rounded-2xl shadow-sm border border-gray-200">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">💡</span>
            </div>
            <p className="text-gray-700 text-sm font-medium">
              Semua paket include akses selamanya dan bisa diakses di semua perangkat
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-xs font-medium text-gray-800">Garansi 30 Hari</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-xs font-medium text-gray-800">Support 24/7</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-xs font-medium text-gray-800">Update Konten Rutin</span>
          </div>
        </div>
      </div>
    </section>
  );
}
