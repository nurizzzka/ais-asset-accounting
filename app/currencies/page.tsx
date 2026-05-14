import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CurrencyRow } from "@/components/ui/CurrencyRow";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function Currencies() {
  const currencies = await prisma.currencies.findMany({
    orderBy: [{ id: "asc" }],
  });

  return (
    <div className="px-2 py-4">
      <div className="flex items-center gap-x-4 mb-4">
        <h1 className="text-2xl">Список валют</h1>
        <Button asChild variant="secondary">
          <Link href="/currencies/create">
            <Plus className="h-4 w-4 mr-1" />
            Добавить валюту
          </Link>
        </Button>
      </div>
      <Table className="w-fit">
        <TableHeader className="bg-blue-300">
          <TableRow>
            <TableHead>Код</TableHead>
            <TableHead>Символ</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Базовая</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {currencies.map((c) => (
            <CurrencyRow
              key={c.id}
              currency={{
                id: c.id,
                code: c.code,
                symbol: c.symbol,
                name: c.name,
                is_base: c.is_base,
                is_active: c.is_active,
              }}
          />
        ))}
      </TableBody>
    </Table>
  </div>)
}
