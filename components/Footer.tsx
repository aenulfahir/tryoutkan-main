import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  Star,
  Shield,
  Users,
  Award,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-10 w-48 h-48 bg-white/3 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/4 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-900"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Top Border Accent */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-white rounded-full"></div>

        <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-8 mb-12">
          {/* Brand Column - Enhanced */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                  <span className="text-black font-bold text-2xl">
                    T
                  </span>
                </div>
                <div>
                  <span className="text-3xl font-bold">TryoutKan</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-400 ml-2">5.0 (2,341 ulasan)</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-base leading-relaxed mb-6">
                Platform tryout online terpercaya dengan teknologi AI untuk membantu kamu meraih
                impian karir. Sudah dipercaya oleh 50,000+ peserta di seluruh Indonesia.
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-center hover:bg-white/10 transition-all duration-300">
                  <Users className="w-6 h-6 text-white mx-auto mb-1" />
                  <div className="text-white font-semibold text-lg">50K+</div>
                  <div className="text-gray-400 text-xs">Pengguna</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-center hover:bg-white/10 transition-all duration-300">
                  <Award className="w-6 h-6 text-white mx-auto mb-1" />
                  <div className="text-white font-semibold text-lg">95%</div>
                  <div className="text-gray-400 text-xs">Kelulusan</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-center hover:bg-white/10 transition-all duration-300">
                  <Shield className="w-6 h-6 text-white mx-auto mb-1" />
                  <div className="text-white font-semibold text-lg">100%</div>
                  <div className="text-gray-400 text-xs">Aman</div>
                </div>
              </div>

              {/* Contact Info - Enhanced */}
              <div className="space-y-4">
                <div className="flex items-center text-white hover:text-gray-300 transition-colors group">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-gray-400 text-sm">0887-4498-5916</div>
                  </div>
                </div>

                <div className="flex items-center text-white hover:text-gray-300 transition-colors group">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-gray-400 text-sm">support@tryoutkan.online</div>
                  </div>
                </div>

                <div className="flex items-center text-white hover:text-gray-300 transition-colors group">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="font-semibold">Alamat</div>
                    <div className="text-gray-400 text-sm">Makassar, Indonesia</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-3">
                <Star className="w-4 h-4" />
              </div>
              Produk
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#pricing"
                  className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Tryout CPNS</span>
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Tryout BUMN</span>
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Paket Kedinasan</span>
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Bank Soal</span>
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Analisis AI</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-4 h-4" />
              </div>
              Perusahaan
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Tentang Kami</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Karir</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Blog</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Kontak</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Partner</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Newsletter */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-4 h-4" />
              </div>
              Dukungan
            </h3>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Pusat Bantuan</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">FAQ</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Syarat & Ketentuan</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-white/50 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Kebijakan Privasi</span>
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Newsletter
              </h4>
              <p className="text-gray-400 text-sm mb-3">
                Dapatkan tips & info terbaru
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email kamu"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/40 transition-colors"
                />
                <button className="bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Enhanced */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-sm mb-2">
                © {currentYear} TryoutKan. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs">
                Build with ❤️ in Indonesia for Indonesian students
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm mr-2">Follow us:</span>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-110"
                  aria-label="Youtube"
                >
                  <Youtube size={18} />
                </a>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Payment:</span>
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-black text-xs font-bold">BCA</span>
                  </div>
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-black text-xs font-bold">Gopay</span>
                  </div>
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-black text-xs font-bold">OVO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
