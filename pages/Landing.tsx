import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import DeviceCompatibility from "@/components/DeviceCompatibility";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import FloatingChatbot from "@/components/FloatingChatbot";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">
                  T
                </span>
              </div>
              <span className="text-xl md:text-2xl font-bold">TryoutKan</span>
            </Link>

            <div className="hidden md:flex items-center space-x-4 md:space-x-8">
              <a
                href="#features"
                className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                Fitur
              </a>
              <a
                href="#how-it-works"
                className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                Cara Kerja
              </a>
              <a
                href="#pricing"
                className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                Harga
              </a>
              <a
                href="#faq"
                className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </a>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="text-xs md:text-sm">
                  Mulai Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <Hero />
      <Features />
      <HowItWorks />
      <DeviceCompatibility />
      <Pricing />
      <FAQ />
      <Footer />
      <FloatingChatbot />
    </div>
  );
}
