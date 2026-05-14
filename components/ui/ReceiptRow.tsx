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

export type ReceiptRowModel = {
  id: number;
  quantity: number;
  price_original: string;
  currency_code: string;
  exchange_rate: string;
  price_kgs: string | null;
  total_kgs: string | null;
  document_number: string | null;
  receipt_date_label: string | null;
  notes: string | null;
  created_at_label: string | null;
  created_by_label: string | null;
  product: { id: number; name: string; sku: string | null; unit: string | null };
};

function moneyLabel(v: string | null | undefined): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function rateLabel(v: string | null | undefined): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export function ReceiptRow({ row }: { row: ReceiptRowModel }) {
  const router = useRouter();
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium whitespace-nowrap">{row.id}</TableCell>
        <TableCell>{row.product.name}</TableCell>
        <TableCell>{row.product.sku || "—"}</TableCell>
        <TableCell>{row.product.unit || "шт"}</TableCell>
        <TableCell className="text-right whitespace-nowrap">{row.quantity}</TableCell>
        <TableCell className="text-right whitespace-nowrap">
          {moneyLabel(row.price_original)}
        </TableCell>
        <TableCell className="whitespace-nowrap">{row.currency_code}</TableCell>
        <TableCell className="text-right whitespace-nowrap">
          {rateLabel(row.exchange_rate)}
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          {moneyLabel(row.price_kgs)}
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          {moneyLabel(row.total_kgs)}
        </TableCell>
        <TableCell className="whitespace-nowrap">{row.document_number || "—"}</TableCell>
        <TableCell className="whitespace-nowrap">{row.receipt_date_label || "—"}</TableCell>
        <TableCell className="whitespace-nowrap">{row.created_by_label || "—"}</TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
          {row.created_at_label || "—"}
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          <ActionRowBtn
            onView={() => setViewOpen(true)}
            onEdit={() => router.push(`/receipts/${row.id}/edit`)}
            is_active
            showInactiveActivate={false}
            showDelete={false}
          />
        </TableCell>
      </TableRow>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="min-w-[min(90vw,32rem)] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Поступление #{row.id}</DialogTitle>
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
              <span className="text-muted-foreground">Цена (валюта): </span>
              {moneyLabel(row.price_original)} {row.currency_code}
            </div>
            <div>
              <span className="text-muted-foreground">Курс к сому: </span>
              {rateLabel(row.exchange_rate)}
            </div>
            <div>
              <span className="text-muted-foreground">Цена (сом): </span>
              {moneyLabel(row.price_kgs)}
            </div>
            <div>
              <span className="text-muted-foreground">Сумма (сом): </span>
              {moneyLabel(row.total_kgs)}
            </div>
            <div>
              <span className="text-muted-foreground">Документ: </span>
              {row.document_number || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Дата поступления: </span>
              {row.receipt_date_label || "—"}
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
    </>
  );
}
