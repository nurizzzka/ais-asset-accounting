"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductFormSupplier } from "@/components/ui/ProductForm";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 md:text-xs dark:bg-input/30",
);

export type ProductIntakeFormProps = {
  suppliers: ProductFormSupplier[];
  cancelHref: string;
  successHref: string;
  submitLabel?: string;
  defaultQuantity?: number;
  defaultReceiptDate: string;
};

/** Создание карточки товара и первой строки поступления (единый сценарий для «Товары» и «Поступления»). */
export function ProductIntakeForm({
  suppliers,
  cancelHref,
  successHref,
  submitLabel = "Создать товар и поступление",
  defaultQuantity = 0,
  defaultReceiptDate,
}: ProductIntakeFormProps) {
  const router = useRouter();
  const initial = useMemo(
    () => ({
      name: "",
      sku: "",
      supplier_id: "",
      quantity: String(defaultQuantity),
      min_quantity: "0",
      unit: "шт",
      price_kgs: "",
      purchase_currency_code: "KGS",
      purchase_price_original: "",
      exchange_rate_at_purchase: "1",
      product_notes: "",
      document_number: "",
      receipt_date: defaultReceiptDate,
      receipt_notes: "",
    }),
    [defaultQuantity, defaultReceiptDate],
  );

  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = form.name.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const qty = Math.max(0, Math.trunc(Number(form.quantity.replace(",", ".")) || 0));
    const minQ = Math.max(0, Math.trunc(Number(form.min_quantity.replace(",", ".")) || 0));

    const payloadBase = {
      name: form.name.trim(),
      sku: form.sku.trim() ? form.sku.trim() : null,
      supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
      min_quantity: minQ,
      unit: form.unit.trim() || "шт",
      price_kgs: form.price_kgs.trim() ? form.price_kgs.trim().replace(",", ".") : "0",
      purchase_currency_code: form.purchase_currency_code.trim() || "KGS",
      purchase_price_original: form.purchase_price_original.trim()
        ? form.purchase_price_original.trim().replace(",", ".")
        : null,
      exchange_rate_at_purchase: form.exchange_rate_at_purchase.trim()
        ? form.exchange_rate_at_purchase.trim().replace(",", ".")
        : "1",
      notes: form.product_notes.trim() ? form.product_notes.trim() : null,
      quantity: qty,
      initial_receipt:
        qty > 0
          ? {
              document_number: form.document_number.trim()
                ? form.document_number.trim()
                : null,
              receipt_date: form.receipt_date.trim() ? form.receipt_date.trim() : null,
              notes: form.receipt_notes.trim() ? form.receipt_notes.trim() : null,
            }
          : null,
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadBase),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сохранить");
      return;
    }

    router.push(successHref);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <div className="text-xs text-muted-foreground">
        Создаётся карточка в каталоге и, при количестве &gt; 0, строка в поступлениях с теми же ценой и курсом.
      </div>

      <div className="space-y-1">
        <div className="text-xs">Наименование</div>
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Например, Ноутбук Dell"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Артикул</div>
        <Input
          value={form.sku}
          onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
          placeholder="Необязательно, уникальный"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Поставщик</div>
        <select
          aria-label="Поставщик"
          className={selectClass}
          value={form.supplier_id}
          onChange={(e) => setForm((p) => ({ ...p, supplier_id: e.target.value }))}
        >
          <option value="">— не выбран —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <div className="text-xs">Количество поступления (остаток на складе)</div>
        <Input
          inputMode="numeric"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          placeholder="0"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Мин. остаток</div>
        <Input
          inputMode="numeric"
          value={form.min_quantity}
          onChange={(e) => setForm((p) => ({ ...p, min_quantity: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Ед. изм.</div>
        <Input
          value={form.unit}
          onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Цена (сом), price_kgs</div>
        <Input
          inputMode="decimal"
          value={form.price_kgs}
          onChange={(e) => setForm((p) => ({ ...p, price_kgs: e.target.value }))}
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="text-xs">Валюта покупки</div>
          <Input
            value={form.purchase_currency_code}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                purchase_currency_code: e.target.value.toUpperCase().slice(0, 3),
              }))
            }
            maxLength={3}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs">Курс к сому</div>
          <Input
            inputMode="decimal"
            value={form.exchange_rate_at_purchase}
            onChange={(e) =>
              setForm((p) => ({ ...p, exchange_rate_at_purchase: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs">Цена в валюте покупки (для строки поступления)</div>
        <Input
          inputMode="decimal"
          value={form.purchase_price_original}
          onChange={(e) =>
            setForm((p) => ({ ...p, purchase_price_original: e.target.value }))
          }
          placeholder="Если пусто — берётся цена в сомах"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Примечание к карточке товара</div>
        <Input
          value={form.product_notes}
          onChange={(e) => setForm((p) => ({ ...p, product_notes: e.target.value }))}
        />
      </div>

      <div className="space-y-3 rounded-md border border-dashed border-input p-3">
        <div className="text-xs font-medium text-muted-foreground">
          Документ первого поступления (если количество &gt; 0)
        </div>
        <div className="space-y-1">
          <div className="text-xs">Номер документа</div>
          <Input
            value={form.document_number}
            onChange={(e) => setForm((p) => ({ ...p, document_number: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs">Дата поступления</div>
          <Input
            type="date"
            value={form.receipt_date}
            onChange={(e) => setForm((p) => ({ ...p, receipt_date: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs">Примечание к поступлению</div>
          <Input
            value={form.receipt_notes}
            onChange={(e) => setForm((p) => ({ ...p, receipt_notes: e.target.value }))}
          />
        </div>
      </div>

      {error && <div className="text-xs text-red-600">{error}</div>}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push(cancelHref)}>
          Назад
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
