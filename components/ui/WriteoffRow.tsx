"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TableRow, TableCell } from "@/components/ui/table";
import ActionRowBtn from "@/components/ui/actionRowbtn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type WriteoffRowModel = {
  id: number;
  quantity: number;
  price_at_writeoff: string;
  currency_code: string;
  total_amount: string | null;
  reason_text: string | null;
  document_number: string | null;
  writeoff_date_label: string | null;
  notes: string | null;
  created_at_label: string | null;
  created_by_label: string | null;
  product: { id: number; name: string; sku: string | null; unit: string | null };
  reason: { id: number; name: string; description: string | null } | null;
};

function moneyLabel(v: string | null | undefined): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function WriteoffRow({ row }: { row: WriteoffRowModel }) {
  const router = useRouter();
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reasonBlock = row.reason
    ? `${row.reason.name}${row.reason.description ? ` — ${row.reason.description}` : ""}`
    : "—";

  const confirmDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/writeoffs/${row.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? "Не удалось удалить");
      return;
    }
    toast.success("Списание удалено, остаток товара восстановлен");
    setDeleteOpen(false);
    router.refresh();
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium whitespace-nowrap">{row.id}</TableCell>
        <TableCell>{row.product.name}</TableCell>
        <TableCell>{row.product.sku || "—"}</TableCell>
        <TableCell>{row.product.unit || "шт"}</TableCell>
        <TableCell className="text-right whitespace-nowrap">{row.quantity}</TableCell>
        <TableCell className="text-right whitespace-nowrap">
          {moneyLabel(row.price_at_writeoff)}
        </TableCell>
        <TableCell className="whitespace-nowrap">{row.currency_code}</TableCell>
        <TableCell className="text-right whitespace-nowrap">
          {moneyLabel(row.total_amount)}
        </TableCell>
        <TableCell className="max-w-[160px] truncate" title={reasonBlock}>
          {reasonBlock}
        </TableCell>
        <TableCell className="whitespace-nowrap">{row.document_number || "—"}</TableCell>
        <TableCell className="whitespace-nowrap">{row.created_by_label || "—"}</TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
          {row.created_at_label || "—"}
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          <ActionRowBtn
            onView={() => setViewOpen(true)}
            onEdit={() => router.push(`/writeoffs/${row.id}/edit`)}
            onDelete={() => setDeleteOpen(true)}
            is_active
            showInactiveActivate={false}
          />
        </TableCell>
      </TableRow>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="min-w-[min(90vw,32rem)] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Списание #{row.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Товар: </span>
              {row.product.name} (ID {row.product.id}
              {row.product.sku ? `, ${row.product.sku}` : ""})
            </div>
            <div>
              <span className="text-muted-foreground">Ед. изм.: </span>
              {row.product.unit || "шт"}
            </div>
            <div>
              <span className="text-muted-foreground">Количество: </span>
              {row.quantity}
            </div>
            <div>
              <span className="text-muted-foreground">Цена на момент списания: </span>
              {moneyLabel(row.price_at_writeoff)} {row.currency_code}
            </div>
            <div>
              <span className="text-muted-foreground">Сумма: </span>
              {moneyLabel(row.total_amount)}
            </div>
            <div>
              <span className="text-muted-foreground">Причина (справочник): </span>
              {row.reason ? (
                <>
                  {row.reason.name}
                  {row.reason.description ? ` — ${row.reason.description}` : ""}
                </>
              ) : (
                "—"
              )}
            </div>
            <div>
              <span className="text-muted-foreground">Текст причины: </span>
              {row.reason_text || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Документ: </span>
              {row.document_number || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Дата списания: </span>
              {row.writeoff_date_label || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Примечание: </span>
              {row.notes || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Кто создал: </span>
              {row.created_by_label || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Создано: </span>
              {row.created_at_label || "—"}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="min-w-[min(90vw,24rem)]">
          <DialogHeader>
            <DialogTitle>Удалить списание?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Запись будет удалена, на остаток товара «{row.product.name}» вернётся{" "}
            <span className="font-medium text-foreground">{row.quantity}</span> шт.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
