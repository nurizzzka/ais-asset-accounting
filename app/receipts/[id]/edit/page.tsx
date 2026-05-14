import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ReceiptForm, type ReceiptFormValues } from "@/components/ui/ReceiptForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

function toDateInput(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function ReceiptEditPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const row = await prisma.receipts.findUnique({
    where: { id },
    include: {
      products: { select: { id: true, name: true, sku: true } },
    },
  });

  if (!row) {
    return (
      <div className="px-2 py-4 space-y-4">
        <h1 className="text-2xl text-center">Поступление не найдено</h1>
      </div>
    );
  }

  const productLabel = `${row.products.name}${row.products.sku ? ` (${row.products.sku})` : ""}`;

  const receipt: ReceiptFormValues = {
    id: row.id,
    product_id: row.product_id,
    product_label: productLabel,
    quantity: row.quantity,
    price_original: String(row.price_original),
    currency_code: row.currency_code,
    exchange_rate: String(row.exchange_rate),
    document_number: row.document_number,
    receipt_date: toDateInput(row.receipt_date),
    notes: row.notes,
  };

  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Редактирование поступления #{row.id}</h1>
      <ReceiptForm receipt={receipt} products={[]} />
    </div>
  );
}
