import { prisma } from "@/lib/db";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SupplierRow } from "@/components/ui/SupplierRow";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
export default async function Suppliers() {
  const suppliers = await prisma.suppliers.findMany({
    orderBy: [{ id: "desc" }],
    include: {
      users: { select: { full_name: true } },
    },
  });

  return (
    <div className="px-2 py-4">
      <div className="flex items-center gap-x-4 mb-4">
        <h1 className="text-2xl">Список поставщиков</h1>
        <Button asChild variant="secondary">
          <Link href="/suppliers/create">
            <Plus className="h-4 w-4 mr-1" />
            Создать поставщика
          </Link>
        </Button>
      </div>
    
      <Table className="w-fit">
        <TableHeader className="bg-blue-300">
          <TableRow>
            <TableHead>Наименование</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Адрес</TableHead>
            <TableHead>ИНН</TableHead>
            <TableHead>Примечание</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <SupplierRow key={supplier.id} supplier={supplier} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}