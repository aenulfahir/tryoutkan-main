import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Mail,
  MessageCircle,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FAQ_DATA = [
  {
    question: "Bagaimana cara membeli paket tryout?",
    answer:
      "Untuk membeli paket tryout: 1) Pastikan saldo Anda mencukupi dengan melakukan top up di menu Billing, 2) Pilih paket tryout yang diinginkan di menu Tryout, 3) Klik tombol 'Beli Paket', 4) Konfirmasi pembelian. Paket akan langsung tersedia di akun Anda.",
  },
  {
    question: "Bagaimana cara memulai tryout setelah membeli?",
    answer:
      "Setelah membeli paket: 1) Buka menu Tryout, 2) Pilih tab 'Paket Saya', 3) Klik paket yang sudah dibeli, 4) Klik tombol 'Mulai Tryout'. Anda akan diarahkan ke halaman pengerjaan tryout dengan timer yang sudah berjalan.",
  },
  {
    question: "Berapa lama waktu pengerjaan tryout?",
    answer:
      "Waktu pengerjaan tryout bervariasi tergantung paket yang dipilih. Umumnya: CPNS (100 menit), BUMN TKD (90 menit), BUMN AKHLAK (60 menit), BUMN TBI (60 menit). Timer akan otomatis berjalan saat Anda memulai tryout dan tryout akan otomatis ter-submit saat waktu habis.",
  },
  {
    question: "Bagaimana cara melihat hasil dan pembahasan?",
    answer:
      "Setelah menyelesaikan tryout: 1) Hasil akan langsung muncul setelah submit, 2) Buka menu 'Hasil & Analisis' untuk melihat semua hasil tryout Anda, 3) Klik pada tryout yang ingin dilihat detailnya, 4) Di halaman detail, Anda dapat melihat skor, ranking, analisis per section, dan pembahasan lengkap untuk setiap soal.",
  },
  {
    question: "Bagaimana sistem ranking bekerja?",
    answer:
      "Sistem ranking mengurutkan peserta berdasarkan skor total dari tertinggi ke terendah. Ranking dihitung secara real-time setiap kali ada peserta yang menyelesaikan tryout. Anda dapat melihat posisi ranking Anda di halaman Hasil atau menu Ranking. Ranking ditampilkan per paket tryout.",
  },
  {
    question: "Bagaimana cara top up saldo?",
    answer:
      "Untuk top up saldo: 1) Buka menu Billing, 2) Masukkan nominal yang ingin di-top up (minimal Rp 10.000), 3) Klik 'Top Up Sekarang', 4) Ikuti instruksi pembayaran yang muncul, 5) Saldo akan otomatis bertambah setelah pembayaran berhasil diverifikasi.",
  },
  {
    question: "Apa yang harus dilakukan jika tryout error/tidak bisa submit?",
    answer:
      "Jika mengalami error: 1) Pastikan koneksi internet stabil, 2) Refresh halaman (jawaban Anda tersimpan otomatis), 3) Jika masih error, screenshot pesan error dan hubungi customer support via email atau WhatsApp. Tim kami akan membantu menyelesaikan masalah Anda.",
  },
  {
    question: "Bagaimana cara melihat history tryout saya?",
    answer:
      "Untuk melihat history tryout: 1) Buka menu 'Hasil & Analisis', 2) Semua tryout yang pernah Anda selesaikan akan ditampilkan di sini, 3) Gunakan filter untuk mencari berdasarkan kategori atau status (Lulus/Tidak Lulus), 4) Gunakan sort untuk mengurutkan berdasarkan tanggal atau skor.",
  },
  {
    question: "Apakah bisa mengulang tryout yang sama?",
    answer:
      "Ya, Anda dapat mengulang tryout yang sama berkali-kali tanpa perlu membeli ulang. Setiap kali mengulang, soal akan diacak ulang dan hasil akan disimpan sebagai session baru. Anda dapat melihat semua hasil tryout Anda di menu 'Hasil & Analisis'.",
  },
  {
    question: "Bagaimana cara menghubungi customer support?",
    answer:
      "Anda dapat menghubungi customer support melalui: 1) Email: aenulfahir03@gmail.com, 2) WhatsApp: 088744985916, 3) AI Chatbot di halaman ini untuk pertanyaan umum. Tim kami siap membantu Anda setiap hari pukul 08.00 - 22.00 WIB.",
  },
];

export default function Help() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendMessage() {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);

    try {
      setLoading(true);

      const apiKey = import.meta.env.VITE_AI_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      // System prompt
      const systemPrompt = `Anda adalah asisten AI untuk platform TryoutKan, platform tryout online untuk persiapan CPNS dan BUMN. 

Platform ini menyediakan:
- Paket tryout: CPNS, BUMN TKD, BUMN AKHLAK, BUMN TBI
- Fitur: Pembelian paket, pengerjaan tryout dengan timer, hasil & analisis lengkap, ranking nasional, pembahasan soal
- Sistem: Top up saldo untuk membeli paket, auto-save jawaban, scoring otomatis, ranking real-time

Tugas Anda:
- Jawab pertanyaan user dengan ramah dan helpful dalam Bahasa Indonesia
- Berikan informasi akurat tentang fitur dan cara penggunaan platform
- Jika user mengalami masalah teknis, arahkan ke customer support (email: aenulfahir03@gmail.com, WA: 088744985916)
- Jika tidak tahu jawaban, akui dengan jujur dan sarankan menghubungi support

Jawab dengan singkat, jelas, dan to the point.`;

      const response = await fetch(
        "https://ai.sumopod.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-5-nano",
            messages: [
              { role: "system", content: systemPrompt },
              ...newMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage =
        data.choices[0]?.message?.content ||
        "Maaf, saya tidak dapat memproses permintaan Anda.";

      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      toast.error("Gagal mengirim pesan", {
        description: "Terjadi kesalahan saat berkomunikasi dengan chatbot.",
      });

      // Add error message
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Maaf, saya mengalami kesulitan teknis. Silakan coba lagi atau hubungi customer support kami.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleClearChat() {
    setMessages([]);
    toast.success("Chat berhasil dihapus");
  }

  function handleEmailSupport() {
    window.location.href =
      "mailto:aenulfahir03@gmail.com?subject=Bantuan TryoutKan";
  }

  function handleWhatsAppSupport() {
    window.open(
      "https://wa.me/6288744985916?text=Halo, saya butuh bantuan dengan TryoutKan",
      "_blank"
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Bantuan & Dukungan</h1>
        <p className="text-muted-foreground">
          Temukan jawaban untuk pertanyaan Anda atau hubungi kami
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowChatbot(true)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950">
                <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">AI Chatbot</h3>
                <p className="text-sm text-muted-foreground">
                  Tanya jawab cepat
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleEmailSupport}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950">
                <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-muted-foreground">
                  aenulfahir03@gmail.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleWhatsAppSupport}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <MessageCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <p className="text-sm text-muted-foreground">088744985916</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Pertanyaan yang Sering Diajukan (FAQ)
          </CardTitle>
          <CardDescription>
            Temukan jawaban untuk pertanyaan umum seputar TryoutKan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_DATA.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Hubungi Kami</CardTitle>
          <CardDescription>
            Tim support kami siap membantu Anda (08.00 - 22.00 WIB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-sm text-muted-foreground">
                  aenulfahir03@gmail.com
                </p>
              </div>
            </div>
            <Button onClick={handleEmailSupport}>
              <Mail className="w-4 h-4 mr-2" />
              Kirim Email
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-medium">WhatsApp</h4>
                <p className="text-sm text-muted-foreground">088744985916</p>
              </div>
            </div>
            <Button
              onClick={handleWhatsAppSupport}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Chatbot Dialog */}
      <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                  <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <DialogTitle>AI Assistant</DialogTitle>
                  <DialogDescription>
                    Tanya apa saja tentang TryoutKan
                  </DialogDescription>
                </div>
              </div>
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearChat}>
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Halo! Ada yang bisa saya bantu?
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Tanyakan apa saja tentang cara menggunakan TryoutKan,
                  fitur-fitur yang tersedia, atau masalah yang Anda alami.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 h-fit">
                      <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="p-2 rounded-lg bg-primary h-fit">
                      <UserIcon className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 h-fit">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ketik pesan Anda..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
