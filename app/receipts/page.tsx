import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReceiptRow, type ReceiptRowModel } from "@/components/ui/ReceiptRow";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

function formatDateOnly(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ru-RU");
}

function formatDateTime(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("ru-RU");
}

export default async function ReceiptsPage() {
  const receipts = await prisma.receipts.findMany({
    orderBy: { id: "desc" },
    include: {
      products: { select: { id: true, name: true, sku: true, unit: true } },
      users: { select: { full_name: true } },
    },
  });

  const rows: ReceiptRowModel[] = receipts.map((r) => ({
    id: r.id,
    quantity: r.quantity,
    price_original: String(r.price_original),
    currency_code: r.currency_code,
    exchange_rate: String(r.exchange_rate),
    price_kgs: r.price_kgs != null ? String(r.price_kgs) : null,
    total_kgs: r.total_kgs != null ? String(r.total_kgs) : null,
    document_number: r.document_number,
    receipt_date_label: formatDateOnly(r.receipt_date),
    notes: r.notes,
    created_at_label: formatDateTime(r.created_at),
    created_by_label: r.users?.full_name ?? null,
    product: {
      id: r.products.id,
      name: r.products.name,
      sku: r.products.sku,
      unit: r.products.unit,
    },
  }));

  return (
    <div className="px-2 py-4">
      <div className="flex items-center gap-x-4 mb-4">
        <h1 className="text-2xl">Поступления</h1>
        <Button asChild variant="secondary">
          <Link href="/receipts/create">
            <Plus className="h-4 w-4 mr-1" />
            Новое поступление
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-max min-w-full">
          <TableHeader className="bg-blue-300">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Товар</TableHead>
              <TableHead>Артикул</TableHead>
              <TableHead>Ед.</TableHead>
              <TableHead className="text-right">Кол-во</TableHead>
              <TableHead className="text-right">Цена (вал.)</TableHead>
              <TableHead>Вал.</TableHead>
              <TableHead className="text-right">Курс</TableHead>
              <TableHead className="text-right">Цена (сом)</TableHead>
              <TableHead className="text-right">Сумма (сом)</TableHead>
              <TableHead>Документ</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Создал</TableHead>
              <TableHead>Создано</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => <ReceiptRow key={row.id} row={row} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
