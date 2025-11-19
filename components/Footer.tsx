import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center space-x-2 mb-6 group">
              <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <span className="font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">
                TryoutKan
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Platform tryout online terpercaya untuk membantu kamu meraih
              impianmu.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone size={16} className="mr-3" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail size={16} className="mr-3" />
                <span>info@tryoutkan.id</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MapPin size={16} className="mr-3" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-bold mb-6 text-lg">Produk</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a
                  href="#pricing"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Tryout CPNS
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Tryout BUMN
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Paket Combo
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Bank Soal
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-bold mb-6 text-lg">Perusahaan</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Tentang Kami
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Karir
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Kontak
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-bold mb-6 text-lg">Dukungan</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Pusat Bantuan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full group-hover:bg-foreground transition-colors" />
                  FAQ
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} TryoutKan. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform duration-200"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform duration-200"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform duration-200"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform duration-200"
              aria-label="Youtube"
            >
              <Youtube size={20} />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform duration-200"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
