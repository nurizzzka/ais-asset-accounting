import { prisma } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function Users() {
  const users = await prisma.users.findMany()
  return (
    <div className="px-2 py-4">
      <h1 className="text-2xl">Список пользователей</h1>
      <Table className="w-fit">
        <TableHeader className="bg-blue-300">
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email || "-"}</TableCell>
                <TableCell>
                  {user.role === "admin" && (
                    <Badge variant="outline">Админ</Badge>
                  )}
                  {user.role === "accountant" && (
                    <Badge variant="outline">Бухгалтер</Badge>
                  )}
                  {user.role === "storekeeper" && (
                    <Badge variant="outline">Кладовщик</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.is_active ? (
                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                      Активен
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Заблокирован</Badge>
                  )}
                </TableCell>
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
