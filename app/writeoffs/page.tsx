import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WriteoffRow, type WriteoffRowModel } from "@/components/ui/WriteoffRow";
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

export default async function WriteOffsPage() {
  const writeoffs = await prisma.writeoffs.findMany({
    orderBy: { id: "desc" },
    include: {
      products: { select: { id: true, name: true, sku: true, unit: true } },
      reason: { select: { id: true, name: true, description: true } },
      users: { select: { full_name: true } },
    },
  });

  const rows: WriteoffRowModel[] = writeoffs.map((w) => ({
    id: w.id,
    quantity: w.quantity,
    price_at_writeoff: String(w.price_at_writeoff),
    currency_code: w.currency_code,
    total_amount: w.total_amount != null ? String(w.total_amount) : null,
    reason_text: w.reason_text,
    document_number: w.document_number,
    writeoff_date_label: formatDateOnly(w.writeoff_date),
    notes: w.notes,
    created_at_label: formatDateTime(w.created_at),
    created_by_label: w.users?.full_name ?? null,
    product: {
      id: w.products.id,
      name: w.products.name,
      sku: w.products.sku,
      unit: w.products.unit,
    },
    reason: w.reason
      ? {
          id: w.reason.id,
          name: w.reason.name,
          description: w.reason.description,
        }
      : null,
  }));

  return (
    <div className="px-2 py-4">
      <div className="flex items-center gap-x-4 mb-4">
        <h1 className="text-2xl">Списания</h1>
        <Button asChild variant="secondary">
          <Link href="/writeoffs/create">
            <Plus className="h-4 w-4 mr-1" />
            Новое списание
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
              <TableHead className="text-right">Цена</TableHead>
              <TableHead>Вал.</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead>Причина (справочник)</TableHead>
              <TableHead>Документ</TableHead>
              <TableHead>Создал</TableHead>
              <TableHead>Создано</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => <WriteoffRow key={row.id} row={row} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
