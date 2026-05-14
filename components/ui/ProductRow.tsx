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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export type ProductRowModel = {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  unit: string | null;
  price_kgs: string | null;
  purchase_currency_code: string | null;
  min_quantity: number | null;
  notes: string | null;
  suppliers: { name: string } | null;
};

export function ProductRow({ product }: { product: ProductRowModel }) {
  const router = useRouter();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isWriteoffOpen, setIsWriteoffOpen] = useState(false);
  const [writeoffQtyStr, setWriteoffQtyStr] = useState("1");

  const maxQty = product.quantity;

  const parsedWriteoffQty = Math.trunc(Number(writeoffQtyStr.replace(",", ".")) || 0);
  const writeoffQtyValid =
    parsedWriteoffQty >= 1 && parsedWriteoffQty <= maxQty;

  const priceLabel =
    product.price_kgs != null && product.price_kgs !== ""
      ? Number(product.price_kgs).toLocaleString("ru-RU")
      : "—";

  const confirmWriteoff = async () => {
    if (!writeoffQtyValid) return;
    const res = await fetch(`/api/products/${product.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: parsedWriteoffQty }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? "Не удалось выполнить списание");
      return;
    }
    const data = await res.json().catch(() => null) as {
      quantityWrittenOff?: number;
      quantityLeft?: number;
    } | null;
    toast.success("Списание выполнено", {
      description: `Списано: ${data?.quantityWrittenOff ?? parsedWriteoffQty} шт., остаток: ${data?.quantityLeft ?? "—"}`,
    });
    router.refresh();
    setIsWriteoffOpen(false);
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{product.id}</TableCell>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.sku || "—"}</TableCell>
        <TableCell>{product.suppliers?.name ?? "—"}</TableCell>
        <TableCell>{product.quantity}</TableCell>
        <TableCell>{product.unit || "шт"}</TableCell>
        <TableCell>{priceLabel}</TableCell>
        <TableCell>{product.purchase_currency_code || "KGS"}</TableCell>
        <TableCell className="text-right">
          <ActionRowBtn
            onView={() => setIsViewOpen(true)}
            onEdit={() => router.push(`/products/${product.id}/edit`)}
            onDelete={() => {
              setWriteoffQtyStr("1");
              setIsWriteoffOpen(true);
            }}
            is_active={product.quantity > 0}
            showInactiveActivate={false}
          />
        </TableCell>
      </TableRow>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="min-w-[80%]">
          <DialogHeader>
            <DialogTitle>Товар: {product.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>Артикул: {product.sku || "—"}</div>
            <div>Поставщик: {product.suppliers?.name ?? "—"}</div>
            <div>Остаток: {product.quantity}</div>
            <div>Мин. остаток: {product.min_quantity ?? "—"}</div>
            <div>Ед. изм.: {product.unit || "шт"}</div>
            <div>Цена (сом): {priceLabel}</div>
            <div>Валюта покупки: {product.purchase_currency_code || "KGS"}</div>
            <div>Примечание: {product.notes || "—"}</div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWriteoffOpen} onOpenChange={setIsWriteoffOpen}>
        <DialogContent className="min-w-[80%]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">
              Списание (writeoffs)
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm">
            Товар: <span className="font-bold">{product.name}</span>. На остатке{" "}
            <span className="font-bold">{maxQty}</span> шт. По умолчанию списывается 1;
            укажите своё число не больше остатка.
          </p>
          <div className="space-y-1 max-w-xs mx-auto">
            <div className="text-xs">Количество к списанию</div>
            <Input
              aria-label="Количество к списанию"
              inputMode="numeric"
              min={1}
              max={maxQty}
              value={writeoffQtyStr}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setWriteoffQtyStr(raw === "" ? "" : raw);
              }}
              onBlur={() => {
                if (writeoffQtyStr === "") setWriteoffQtyStr("1");
              }}
            />
            {!writeoffQtyValid && writeoffQtyStr !== "" && (
              <div className="text-xs text-red-600">
                Введите от 1 до {maxQty}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsWriteoffOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={!writeoffQtyValid}
              onClick={confirmWriteoff}
            >
              Списать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
