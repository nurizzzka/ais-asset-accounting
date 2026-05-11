"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ActionRowBtn from "@/components/ui/actionRowbtn";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Supplier = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  inn: string | null;
  notes: string | null;
  created_at: Date | string | null;
  created_by: number | null;
  is_active: boolean;
  users: { full_name: string } | null;
};

interface SupplierRowProps {
  supplier: Supplier;
}

export const SupplierRow: React.FC<SupplierRowProps> = ({ supplier }) => {
  const router = useRouter();

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const handleView = () => {
    setIsViewOpen(true);
  };

  const handleEdit = () => {
    router.push(`/suppliers/${supplier.id}/edit`);
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleActivate = () => {
    setIsActivateOpen(true);
  };
  const confirmActivate = async () => {
    const response = await fetch(`/api/suppliers/${supplier.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
    });
    if (!response.ok) {
      toast.error("Не удалось активировать поставщика");
      return;
    }
    toast.success("Поставщик активирован");
    router.refresh();
    setIsActivateOpen(false);
  };
  const confirmDelete = async () => {
    const response = await fetch(`/api/suppliers/${supplier.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
    if (!response.ok) {
      toast.error("Не удалось удалить поставщика");
      return;
    }
    toast.success("Поставщик удалён", {
      description: "Запись деактивирована",
    });
    router.refresh();
    setIsDeleteOpen(false);
  };  
  return (
    <>
      <TableRow>
        <TableCell>{supplier.name}</TableCell>
        <TableCell>{supplier.phone || "-"}</TableCell>
        <TableCell>{supplier.email || "-"}</TableCell>
        <TableCell>{supplier.address || "-"}</TableCell>
        <TableCell>{supplier.inn || "-"}</TableCell>
        <TableCell>{supplier.notes || "-"}</TableCell>
        <TableCell>
          {supplier.is_active ? (
            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              Активен
            </Badge>
          ) : (
            <Badge variant="destructive">Не активен</Badge>
          )}
        </TableCell>
        <TableCell className="text-right">
          <ActionRowBtn
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={handleActivate}
            is_active={supplier.is_active}
          />
        </TableCell>
      </TableRow>
    
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="min-w-[80%]">
          <DialogHeader>
            <DialogTitle>Поставщик: {supplier.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">   
            <div>Телефон: {supplier.phone || "-"}</div>
            <div>Email: {supplier.email || "-"}</div>
            <div>Адрес: {supplier.address || "-"}</div>
            <div>ИНН: {supplier.inn || "-"}</div>
            <div>Примечание: {supplier.notes || "-"}</div>
            <div>Дата создания: {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString("ru-RU") : "-"}</div>
            <div>Создан пользователем: {supplier.users?.full_name ?? "-"}</div>
            <div>Статус: {supplier.is_active ? <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">Активен</Badge> : <Badge variant="destructive">Не активен</Badge>}</div>
          </div>
        </DialogContent>
      </Dialog>
            
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="min-w-[80%]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">Удалить поставщика?</DialogTitle>
          </DialogHeader>
          <p className="text-center">Вы уверены, что хотите удалить <span className="font-bold">{supplier.name}</span>?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Отмена
            </Button>
            {supplier.is_active ? (
              <Button variant="destructive" onClick={confirmDelete}>
                Удалить
              </Button>
            ) : (
              <Button variant="outline" onClick={confirmActivate}>
                Активировать
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isActivateOpen} onOpenChange={setIsActivateOpen}>
        <DialogContent className="min-w-[80%]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">Активировать поставщика?</DialogTitle>
          </DialogHeader>
          <p className="text-center">Вы уверены, что хотите активировать <span className="font-bold">{supplier.name}</span>?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsActivateOpen(false)}>
              Отмена
            </Button>
            <Button variant="outline" onClick={confirmActivate}>
              Активировать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};