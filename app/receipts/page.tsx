import { prisma } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function Receipts() {
  const receipts = await prisma.receipts.findMany()
  return (
    <div className="px-2 py-4">
      <h1 className="text-2xl">Список поступлений</h1>
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
          {receipts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>{receipt.product_id}</TableCell>
                <TableCell>{receipt.quantity}</TableCell>
                <TableCell>
                  {receipt.price_original?.toLocaleString()}
                </TableCell>
                <TableCell>{receipt.currency_code}</TableCell>
                <TableCell>{receipt.exchange_rate?.toFixed(4)}</TableCell>
                <TableCell>{receipt.price_kgs?.toLocaleString()}</TableCell>
                <TableCell>{receipt.total_kgs?.toLocaleString()}</TableCell>
                <TableCell>{receipt.document_number || "-"}</TableCell>
                {receipt.receipt_date
                  ? new Intl.DateTimeFormat("ru-RU").format(
                      receipt.receipt_date
                    )
                  : "-"}
                <TableCell>{receipt.created_by}</TableCell>
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
