import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Apa itu TryoutKan?",
    answer:
      "TryoutKan adalah platform tryout online yang menyediakan ribuan soal latihan untuk berbagai jenis ujian seperti UTBK, CPNS, dan ujian lainnya. Kami menyediakan analisis mendalam untuk membantu kamu mempersiapkan diri dengan maksimal.",
  },
  {
    question: "Apakah ada tryout gratis?",
    answer:
      "Ya! Kami menyediakan paket gratis yang memungkinkan kamu mengakses 5 tryout per bulan tanpa biaya apapun. Kamu bisa upgrade ke paket premium kapan saja untuk akses unlimited.",
  },
  {
    question: "Bagaimana sistem penilaian bekerja?",
    answer:
      "Sistem penilaian kami menggunakan algoritma yang menyesuaikan dengan format ujian sesungguhnya. Setiap jawaban akan langsung dinilai dan kamu akan mendapatkan skor beserta pembahasan detail untuk setiap soal.",
  },
  {
    question: "Apakah saya bisa mengakses dari smartphone?",
    answer:
      "Tentu saja! TryoutKan dapat diakses dari berbagai device termasuk smartphone, tablet, dan komputer. Website kami fully responsive sehingga kamu bisa belajar kapan saja dan dimana saja.",
  },
  {
    question: "Bagaimana cara membatalkan langganan?",
    answer:
      "Kamu bisa membatalkan langganan kapan saja melalui dashboard akun kamu. Tidak ada biaya pembatalan dan kamu tetap bisa mengakses fitur premium hingga akhir periode berlangganan.",
  },
  {
    question: "Apakah soal-soal selalu diperbarui?",
    answer:
      "Ya, tim kami secara rutin menambahkan soal-soal baru dan memperbarui bank soal sesuai dengan tren dan format ujian terkini. Member premium mendapatkan akses early access ke soal-soal terbaru.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xl text-muted-foreground">
            Temukan jawaban untuk pertanyaan umummu
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
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
      </div>
    </section>
  );
}
