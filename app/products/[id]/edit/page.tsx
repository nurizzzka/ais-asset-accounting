import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductForm, type ProductFormValues } from "@/components/ui/ProductForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductEditPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const row = await prisma.products.findUnique({
    where: { id },
  });

  if (!row) {
    return (
      <div className="px-2 py-4 space-y-4">
        <h1 className="text-2xl text-center">Товар не найден</h1>
      </div>
    );
  }

  const suppliers = await prisma.suppliers.findMany({
    where: {
      OR: [
        { is_active: true },
        ...(row.supplier_id != null ? [{ id: row.supplier_id }] : []),
      ],
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const product: ProductFormValues = {
    id: row.id,
    name: row.name,
    sku: row.sku,
    supplier_id: row.supplier_id,
    quantity: row.quantity,
    min_quantity: row.min_quantity,
    unit: row.unit,
    price_kgs: row.price_kgs != null ? String(row.price_kgs) : null,
    purchase_currency_code: row.purchase_currency_code,
    purchase_price_original:
      row.purchase_price_original != null ? String(row.purchase_price_original) : null,
    exchange_rate_at_purchase:
      row.exchange_rate_at_purchase != null
        ? String(row.exchange_rate_at_purchase)
        : null,
    notes: row.notes,
  };

  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Редактирование товара</h1>
      <ProductForm suppliers={suppliers} product={product} />
    </div>
  );
}
