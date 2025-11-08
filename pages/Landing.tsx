import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import DeviceCompatibility from "@/components/DeviceCompatibility";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import FloatingChatbot from "@/components/FloatingChatbot";

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Black Navbar */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">
                  T
                </span>
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">TryoutKan</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-sm md:text-base text-gray-300 hover:text-white transition-colors duration-200"
              >
                Fitur
              </a>
              <a
                href="#how-it-works"
                className="text-sm md:text-base text-gray-300 hover:text-white transition-colors duration-200"
              >
                Cara Kerja
              </a>
              <a
                href="#pricing"
                className="text-sm md:text-base text-gray-300 hover:text-white transition-colors duration-200"
              >
                Harga
              </a>
              <a
                href="#faq"
                className="text-sm md:text-base text-gray-300 hover:text-white transition-colors duration-200"
              >
                FAQ
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/login">
                <button className="text-xs md:text-sm text-gray-300 hover:text-white border border-transparent hover:border-white/20 px-4 py-2 rounded-lg transition-all duration-200">
                  Masuk
                </button>
              </Link>
              <Link to="/register">
                <button className="text-xs md:text-sm bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-all duration-200">
                  Mulai Gratis
                </button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Fitur
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cara Kerja
                </a>
                <a
                  href="#pricing"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Harga
                </a>
                <a
                  href="#faq"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full text-gray-300 hover:text-white border border-transparent hover:border-white/20 px-4 py-2 rounded-lg transition-all duration-200 text-left">
                      Masuk
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-left">
                      Mulai Gratis
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
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
