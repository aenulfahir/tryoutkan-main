import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Payment } from "@/types/database";
import { Profile } from "@/services/profile";

export const generatePaymentInvoice = (payment: Payment, userProfile: Profile | null) => {
    const doc = new jsPDF();

    // Colors
    const primaryColor = "#000000"; // Black
    const secondaryColor = "#666666"; // Gray

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Generate Invoice Number
    const invoiceNumber = payment.external_id || `INV-${new Date(payment.created_at).toISOString().slice(0, 10).replace(/-/g, "")}-${payment.id.slice(0, 8).toUpperCase()}`;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "normal");
    doc.text("TryoutKan Platform", 14, 26);
    doc.text("support@tryoutkan.com", 14, 30);

    // Invoice Details (Right aligned)
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text(`Invoice No: ${invoiceNumber}`, 196, 20, { align: "right" });
    doc.text(`Date: ${formatDate(payment.created_at)}`, 196, 25, { align: "right" });

    // Status Badge
    const status = (payment.status as string).toUpperCase();
    const isPaid = status === "PAID" || status === "COMPLETED";

    doc.setFillColor(isPaid ? "#dcfce7" : "#f3f4f6");
    doc.setDrawColor(isPaid ? "#166534" : "#374151");
    doc.roundedRect(160, 30, 36, 8, 1, 1, "FD");
    doc.setTextColor(isPaid ? "#166534" : "#374151");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(status, 178, 35.5, { align: "center" });

    // Bill To
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 50);

    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "normal");
    doc.text(userProfile?.name || "Guest User", 14, 56);
    doc.text(userProfile?.email || "-", 14, 61);
    if (userProfile?.phone) {
        doc.text(userProfile.phone, 14, 66);
    }

    // Table
    const tableData = [
        [
            "Top Up Balance",
            "Top up saldo TryoutKan",
            formatCurrency(payment.amount)
        ]
    ];

    autoTable(doc, {
        startY: 80,
        head: [["Item", "Description", "Amount"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: primaryColor, textColor: "#ffffff", fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: "bold" },
            1: { cellWidth: "auto" },
            2: { cellWidth: 40, halign: "right" },
        },
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Total", 150, finalY);
    doc.text(formatCurrency(payment.amount), 196, finalY, { align: "right" });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", 105, 280, { align: "center" });
    doc.text("TryoutKan - The Best Tryout Platform", 105, 285, { align: "center" });

    // Save
    doc.save(`Invoice-${invoiceNumber}.pdf`);
};
