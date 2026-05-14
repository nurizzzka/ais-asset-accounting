import { prisma } from "@/lib/db";
import { ProductIntakeForm } from "@/components/ui/ProductIntakeForm";

export default async function ProductCreatePage() {
  const suppliers = await prisma.suppliers.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Создание товара</h1>
      <ProductIntakeForm
        suppliers={suppliers}
        cancelHref="/products"
        successHref="/products"
        submitLabel="Создать"
        defaultQuantity={0}
        defaultReceiptDate={today}
      />
    </div>
  );
}
