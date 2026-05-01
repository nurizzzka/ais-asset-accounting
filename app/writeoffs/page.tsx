import { prisma } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function WriteOffs() {
  const writeoffs = await prisma.writeoffs.findMany()
  return (
    <div className="px-2 py-4">
      <h1 className="text-2xl">Список списаний</h1>
      <Table className="w-fit">
        <TableHeader className="bg-blue-300">
          <TableRow>
            <TableHead>Товар</TableHead>
            <TableHead>Количество</TableHead>
            <TableHead>Цена (валюта)</TableHead>
            <TableHead>Валюта</TableHead>
            <TableHead>Курс</TableHead>
            <TableHead>Цена (сом)</TableHead>
            <TableHead>Сумма (сом)</TableHead>
            <TableHead>Документ</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Кто создал</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {writeoffs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            writeoffs.map((writeoff) => (
              <TableRow key={writeoff.id}>
                <TableCell>{writeoff.id}</TableCell>
                <TableCell>{writeoff.quantity}</TableCell>
               
                <TableCell className="text-right">
                  {/* Кнопки редактирования/удаления */}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
