import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/ui/ProductForm";

export default async function ProductCreatePage() {
  const suppliers = await prisma.suppliers.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Создание товара</h1>
      <ProductForm
        suppliers={suppliers}
        product={{
          id: null,
          name: "",
          sku: null,
          supplier_id: null,
          quantity: 0,
          min_quantity: 0,
          unit: "шт",
          price_kgs: null,
          purchase_currency_code: "KGS",
          purchase_price_original: null,
          exchange_rate_at_purchase: "1",
          notes: null,
        }}
      />
    </div>
  );
}
