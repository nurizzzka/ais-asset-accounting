"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProductFormSupplier = { id: number; name: string };

export type ProductFormValues = {
  id: number | null;
  name: string;
  sku: string | null;
  supplier_id: number | null;
  quantity: number;
  min_quantity: number | null;
  unit: string | null;
  price_kgs: string | null;
  purchase_currency_code: string | null;
  purchase_price_original: string | null;
  exchange_rate_at_purchase: string | null;
  notes: string | null;
};

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 md:text-xs dark:bg-input/30",
);

export function ProductForm({
  product,
  suppliers,
}: {
  product: ProductFormValues;
  suppliers: ProductFormSupplier[];
}) {
  const router = useRouter();
  const isCreate = product.id === null;
  const initial = useMemo(
    () => ({
      name: product.name ?? "",
      sku: product.sku ?? "",
      supplier_id:
        product.supplier_id != null && product.supplier_id > 0
          ? String(product.supplier_id)
          : "",
      quantity: String(product.quantity ?? 0),
      min_quantity:
        product.min_quantity != null ? String(product.min_quantity) : "0",
      unit: product.unit ?? "шт",
      price_kgs: product.price_kgs ?? "",
      purchase_currency_code: (product.purchase_currency_code ?? "KGS").toUpperCase(),
      purchase_price_original: product.purchase_price_original ?? "",
      exchange_rate_at_purchase: product.exchange_rate_at_purchase ?? "1",
      notes: product.notes ?? "",
    }),
    [product],
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
      notes: form.notes.trim() ? form.notes.trim() : null,
    };

    const res = isCreate
      ? await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payloadBase, quantity: qty }),
        })
      : await fetch(`/api/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadBase),
        });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сохранить изменения");
      return;
    }

    router.push("/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
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

      {isCreate ? (
        <div className="space-y-1">
          <div className="text-xs">Начальный остаток (создаётся поступление в receipts)</div>
          <Input
            inputMode="numeric"
            value={form.quantity}
            onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
            placeholder="0"
          />
        </div>
      ) : (
        <div className="space-y-1">
          <div className="text-xs">Остаток</div>
          <div className="text-sm border border-input px-2.5 py-1.5 bg-muted/30">
            {product.quantity} (меняется только поступлениями и списаниями)
          </div>
        </div>
      )}

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
                purchase_currency_code: e.target.value.toUpperCase(),
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
        <div className="text-xs">Цена в валюте покупки (для поступления)</div>
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
        <div className="text-xs">Примечание</div>
        <Input
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        />
      </div>

      {error && <div className="text-xs text-red-600">{error}</div>}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push("/products")}>
          Назад
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isCreate ? "Создать" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
