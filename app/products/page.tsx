import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductRow, type ProductRowModel } from "@/components/ui/ProductRow";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function Products() {
  const products = await prisma.products.findMany({
    orderBy: [{ id: "desc" }],
    include: {
      suppliers: { select: { name: true } },
    },
  });

  const rows: ProductRowModel[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    quantity: p.quantity,
    unit: p.unit,
    price_kgs: p.price_kgs != null ? String(p.price_kgs) : null,
    purchase_currency_code: p.purchase_currency_code,
    min_quantity: p.min_quantity,
    notes: p.notes,
    suppliers: p.suppliers,
  }));

  return (
    <div className="px-2 py-4">
      <div className="flex items-center gap-x-4 mb-4">
        <h1 className="text-2xl">Список имущества</h1>
        <Button asChild variant="secondary">
          <Link href="/products/create">
            <Plus className="h-4 w-4 mr-1" />
            Создать товар
          </Link>
        </Button>
      </div>
      <Table className="w-fit">
        <TableHeader className="bg-blue-300">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Наименование</TableHead>
            <TableHead>Артикул</TableHead>
            <TableHead>Поставщик</TableHead>
            <TableHead>Остаток</TableHead>
            <TableHead>Ед. изм.</TableHead>
            <TableHead>Цена (сом)</TableHead>
            <TableHead>Валюта покупки</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            rows.map((product) => <ProductRow key={product.id} product={product} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
