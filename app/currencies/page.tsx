import { prisma } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function Currencies() {
  const currencies = await prisma.currencies.findMany()
  return (
    <div className="px-2 py-4">
      <h1 className="text-2xl">Список валют</h1>
      <Table className="w-fit">
        <TableHeader className="bg-blue-300">
          <TableRow>
            <TableHead>Код</TableHead>
            <TableHead>Символ</TableHead>
            <TableHead>Название</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencies.map((currency) => (
            <TableRow key={currency.id}>
              <TableCell>{currency.code}</TableCell>
              <TableCell>{currency.symbol}</TableCell>
              <TableCell>{currency.name}</TableCell>
              <TableCell className="text-right">{/* Кнопки */}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
