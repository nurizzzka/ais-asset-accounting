import { prisma } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function Products() {
  const products = await prisma.products.findMany()
  return (
    <div className="px-2 py-4">
      <h1 className="text-2xl">Список имущества</h1>
      <Table className="w-fit">
        <TableHeader className="bg-blue-300">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Наименование</TableHead>
            <TableHead>Артикул</TableHead>
            <TableHead>Остаток</TableHead>
            <TableHead>Ед. изм.</TableHead>
            <TableHead>Цена (сом)</TableHead>
            <TableHead>Валюта покупки</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku || "-"}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.unit || "шт"}</TableCell>
                <TableCell>{product.price_kgs?.toLocaleString()}</TableCell>
                <TableCell>{product.purchase_currency_code || "KGS"}</TableCell>
                <TableCell className="text-right">
                  {/* Сюда можно добавить кнопки редактирования/удаления */}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
