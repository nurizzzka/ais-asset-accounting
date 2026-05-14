import { prisma } from "@/lib/db";
import { ReceiptCreateClient } from "@/components/ui/ReceiptCreateClient";

export default async function ReceiptCreatePage() {
  const [products, suppliers] = await Promise.all([
    prisma.products.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        purchase_price_original: true,
        purchase_currency_code: true,
        exchange_rate_at_purchase: true,
        suppliers: { select: { id: true, name: true } },
      },
    }),
    prisma.suppliers.findMany({
      where: { is_active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Новое поступление</h1>
      <ReceiptCreateClient
        suppliers={suppliers}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          quantity: p.quantity,
          purchase_price_original:
            p.purchase_price_original != null ? String(p.purchase_price_original) : null,
          purchase_currency_code: p.purchase_currency_code,
          exchange_rate_at_purchase:
            p.exchange_rate_at_purchase != null ? String(p.exchange_rate_at_purchase) : null,
          supplier_id: p.suppliers?.id ?? null,
          supplier_name: p.suppliers?.name ?? null,
        }))}
        defaultReceiptDate={today}
        receiptDefaults={{
          id: null,
          product_id: 0,
          product_label: "",
          quantity: 1,
          price_original: "0",
          currency_code: "KGS",
          exchange_rate: "1",
          document_number: null,
          receipt_date: today,
          notes: null,
        }}
      />
    </div>
  );
}
