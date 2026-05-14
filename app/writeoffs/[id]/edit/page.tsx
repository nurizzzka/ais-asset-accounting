import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { WriteoffForm, type WriteoffFormValues } from "@/components/ui/WriteoffForm";

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

export default async function WriteoffEditPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const row = await prisma.writeoffs.findUnique({
    where: { id },
    include: {
      products: { select: { id: true, name: true, sku: true } },
    },
  });

  if (!row) {
    return (
      <div className="px-2 py-4 space-y-4">
        <h1 className="text-2xl text-center">Списание не найдено</h1>
      </div>
    );
  }

  const reasons = await prisma.writeoff_reasons.findMany({
    where: {
      OR: [
        { is_active: true },
        { is_active: null },
        ...(row.reason_id != null ? [{ id: row.reason_id }] : []),
      ],
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true },
  });

  const productLabel = `${row.products.name}${row.products.sku ? ` (${row.products.sku})` : ""}`;

  const writeoff: WriteoffFormValues = {
    id: row.id,
    product_id: row.product_id,
    product_label: productLabel,
    quantity: row.quantity,
    reason_id: row.reason_id,
    reason_text: row.reason_text,
    price_at_writeoff: String(row.price_at_writeoff),
    currency_code: row.currency_code,
    document_number: row.document_number,
    writeoff_date: toDateInput(row.writeoff_date),
    notes: row.notes,
  };

  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Редактирование списания #{row.id}</h1>
      <WriteoffForm writeoff={writeoff} products={[]} reasons={reasons} />
    </div>
  );
}
