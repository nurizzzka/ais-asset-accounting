import { prisma } from "@/lib/db";
import { WriteoffForm } from "@/components/ui/WriteoffForm";

export default async function WriteoffCreatePage() {
  const [products, reasons] = await Promise.all([
    prisma.products.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        price_kgs: true,
        purchase_currency_code: true,
      },
    }),
    prisma.writeoff_reasons.findMany({
      where: {
        OR: [{ is_active: true }, { is_active: null }],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true },
    }),
  ]);

  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Новое списание</h1>
      <WriteoffForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          quantity: p.quantity,
          price_kgs: p.price_kgs != null ? String(p.price_kgs) : null,
          purchase_currency_code: p.purchase_currency_code,
        }))}
        reasons={reasons}
        writeoff={{
          id: null,
          product_id: 0,
          product_label: "",
          quantity: 1,
          reason_id: null,
          reason_text: null,
          price_at_writeoff: "0",
          currency_code: "KGS",
          document_number: null,
          writeoff_date: today,
          notes: null,
        }}
      />
    </div>
  );
}
