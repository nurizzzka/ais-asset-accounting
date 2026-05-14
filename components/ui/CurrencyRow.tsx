"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ActionRowBtn from "@/components/ui/actionRowbtn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Currency = {
  id: number;
  code: string;
  symbol: string;
  name: string;
  is_base: boolean | null;
  is_active: boolean;
};

interface CurrencyRowProps {
  currency: Currency;
}

export const CurrencyRow: React.FC<CurrencyRowProps> = ({ currency }) => {
  const router = useRouter();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);

  const handleEdit = () => {
    router.push(`/currencies/${currency.id}/edit`);
  };

  const confirmActivate = async () => {
    const response = await fetch(`/api/currencies/${currency.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
    });
    if (!response.ok) {
      toast.error("Не удалось активировать валюту");
      return;
    }
    toast.success("Валюта активирована");
    router.refresh();
    setIsActivateOpen(false);
    setIsDeleteOpen(false);
  };

  const confirmDelete = async () => {
    const response = await fetch(`/api/currencies/${currency.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
    if (!response.ok) {
      toast.error("Не удалось деактивировать валюту");
      return;
    }
    toast.success("Валюта удалена", {
      description: "Запись деактивирована",
    });
    router.refresh();
    setIsDeleteOpen(false);
  };

  return (
    <>
      <TableRow>
        <TableCell>{currency.code}</TableCell>
        <TableCell>{currency.symbol}</TableCell>
        <TableCell>{currency.name}</TableCell>
        <TableCell>
          {currency.is_base ? (
            <Badge variant="secondary">Да</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          {currency.is_active ? (
            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              Активна
            </Badge>
          ) : (
            <Badge variant="destructive">Не активна</Badge>
          )}
        </TableCell>
        <TableCell className="text-right">
          <ActionRowBtn
            onView={() => setIsViewOpen(true)}
            onEdit={handleEdit}
            onDelete={() => setIsDeleteOpen(true)}
            onActivate={() => setIsActivateOpen(true)}
            is_active={currency.is_active}
          />
        </TableCell>
      </TableRow>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="min-w-[80%]">
          <DialogHeader>
            <DialogTitle>Валюта: {currency.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>Символ: {currency.symbol}</div>
            <div>Название: {currency.name}</div>
            <div>Базовая: {currency.is_base ? "Да" : "Нет"}</div>
            <div>
              Статус:{" "}
              {currency.is_active ? (
                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                  Активна
                </Badge>
              ) : (
                <Badge variant="destructive">Не активна</Badge>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="min-w-[80%]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">
              Удалить валюту?
            </DialogTitle>
          </DialogHeader>
          <p className="text-center">
            Вы уверены, что хотите удалить{" "}
            <span className="font-bold">
              {currency.code} — {currency.name}
            </span>
            ?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Отмена
            </Button>
            {currency.is_active ? (
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
            <DialogTitle className="text-lg font-bold text-center">
              Активировать валюту?
            </DialogTitle>
          </DialogHeader>
          <p className="text-center">
            Вы уверены, что хотите активировать{" "}
            <span className="font-bold">
              {currency.code} — {currency.name}
            </span>
            ?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsActivateOpen(false)}
            >
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
