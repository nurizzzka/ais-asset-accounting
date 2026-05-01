import { prisma } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function Suppliers() {
  const suppliers = await prisma.suppliers.findMany()
  return (
    <div className="px-2 py-4">
      <h1 className="text-2xl">Список поставщиков</h1>
      <Table className="w-fit">
        <TableHeader className="bg-blue-300">
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Адрес</TableHead>
            <TableHead>ИНН</TableHead>
            <TableHead>Примечание</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>{supplier.name}</TableCell>
              <TableCell>{supplier.phone || "-"}</TableCell>
              <TableCell>{supplier.email || "-"}</TableCell>
              <TableCell>{supplier.address || "-"}</TableCell>
              <TableCell>{supplier.inn || "-"}</TableCell>
              <TableCell>{supplier.notes || "-"}</TableCell>
              <TableCell className="text-right">{/* Кнопки */}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
