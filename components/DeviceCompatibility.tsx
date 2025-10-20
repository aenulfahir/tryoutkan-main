import { Monitor, Smartphone, Tablet, Check, Laptop } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DeviceCompatibility() {
  return (
    <section className="py-12 md:py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
            Tersedia di Semua Perangkat
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Belajar kapan saja, dimana saja dengan perangkat yang kamu miliki
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="flex flex-col justify-center">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">
              Akses Tanpa Batas, Belajar Lebih Fleksibel
            </h3>
            <p className="text-muted-foreground mb-6">
              Platform TryoutKan dirancang untuk memberikan pengalaman belajar
              yang optimal di berbagai perangkat. Sinkronisasi real-time
              memungkinkan kamu melanjutkan belajar dimana saja.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Check className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Responsive Design</h4>
                  <p className="text-sm text-muted-foreground">
                    Tampilan optimal di semua ukuran layar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Check className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Auto-Sync Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Progress belajar tersimpan otomatis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Check className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Offline Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Download soal untuk belajar tanpa internet
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border p-4 bg-muted/30">
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Monitor className="text-primary" size={32} />
                    </div>
                    <h4 className="font-semibold mb-1">Desktop</h4>
                    <p className="text-sm text-muted-foreground">
                      Windows, Mac, Linux
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border p-4 bg-muted/30">
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Laptop className="text-primary" size={32} />
                    </div>
                    <h4 className="font-semibold mb-1">Laptop</h4>
                    <p className="text-sm text-muted-foreground">
                      Semua merk laptop
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border p-4 bg-muted/30">
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Tablet className="text-primary" size={32} />
                    </div>
                    <h4 className="font-semibold mb-1">Tablet</h4>
                    <p className="text-sm text-muted-foreground">
                      iPad, Android Tablet
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border p-4 bg-muted/30">
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Smartphone className="text-primary" size={32} />
                    </div>
                    <h4 className="font-semibold mb-1">Smartphone</h4>
                    <p className="text-sm text-muted-foreground">
                      iOS & Android
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mockup devices illustration */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
