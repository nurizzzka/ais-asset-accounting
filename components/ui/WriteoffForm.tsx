"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WriteoffFormProduct = {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  price_kgs: string | null;
  purchase_currency_code: string | null;
};

export type WriteoffFormReason = {
  id: number;
  name: string;
  description: string | null;
};

export type WriteoffFormValues = {
  id: number | null;
  product_id: number;
  product_label: string;
  quantity: number;
  reason_id: number | null;
  reason_text: string | null;
  price_at_writeoff: string;
  currency_code: string;
  document_number: string | null;
  writeoff_date: string | null;
  notes: string | null;
};

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 md:text-xs dark:bg-input/30",
);

export function WriteoffForm({
  writeoff,
  products,
  reasons,
}: {
  writeoff: WriteoffFormValues;
  products: WriteoffFormProduct[];
  reasons: WriteoffFormReason[];
}) {
  const router = useRouter();
  const isCreate = writeoff.id === null;

  const initial = useMemo(
    () => ({
      product_id: isCreate ? "" : String(writeoff.product_id),
      quantity: String(writeoff.quantity ?? 1),
      reason_id:
        writeoff.reason_id != null && writeoff.reason_id > 0
          ? String(writeoff.reason_id)
          : "",
      reason_text: writeoff.reason_text ?? "",
      price_at_writeoff: writeoff.price_at_writeoff || "0",
      currency_code: (writeoff.currency_code ?? "KGS").toUpperCase().slice(0, 3),
      document_number: writeoff.document_number ?? "",
      writeoff_date: writeoff.writeoff_date ?? "",
      notes: writeoff.notes ?? "",
    }),
    [writeoff, products, isCreate],
  );

  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const qty = Math.max(0, Math.trunc(Number(form.quantity.replace(",", ".")) || 0));
  const canSubmit =
    form.product_id !== "" &&
    qty >= 1 &&
    form.price_at_writeoff.trim() !== "" &&
    form.currency_code.trim().length >= 1;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const productId = Number(form.product_id);
    if (!Number.isFinite(productId) || productId <= 0) {
      setError("Выберите товар");
      return;
    }

    if (qty < 1) {
      setError("Количество не меньше 1");
      return;
    }

    const priceAt = form.price_at_writeoff.trim().replace(",", ".") || "0";
    const currency = form.currency_code.trim().toUpperCase().slice(0, 3) || "KGS";
    const reasonId = form.reason_id ? Number(form.reason_id) : null;
    const payload = {
      product_id: productId,
      quantity: qty,
      reason_id: reasonId && reasonId > 0 ? reasonId : null,
      reason_text: form.reason_text.trim() ? form.reason_text.trim() : null,
      price_at_writeoff: priceAt,
      currency_code: currency,
      document_number: form.document_number.trim() ? form.document_number.trim() : null,
      writeoff_date: form.writeoff_date.trim() ? form.writeoff_date.trim() : null,
      notes: form.notes.trim() ? form.notes.trim() : null,
    };

    const res = isCreate
      ? await fetch("/api/writeoffs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/writeoffs/${writeoff.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сохранить");
      return;
    }

    router.push("/writeoffs");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      {!isCreate && (
        <div className="space-y-1">
          <div className="text-xs">Товар</div>
          <div className="text-sm border border-input px-2.5 py-1.5 bg-muted/30">
            {writeoff.product_label}
          </div>
        </div>
      )}

      {isCreate && (
        <div className="space-y-1">
          <div className="text-xs">Товар</div>
          <select
            aria-label="Товар"
            className={selectClass}
            value={form.product_id}
            onChange={(e) => {
              const v = e.target.value;
              const p = products.find((x) => String(x.id) === v);
              setForm((prev) => ({
                ...prev,
                product_id: v,
                price_at_writeoff:
                  p != null
                    ? p.price_kgs != null
                      ? String(p.price_kgs)
                      : "0"
                    : prev.price_at_writeoff,
                currency_code:
                  p != null
                    ? (p.purchase_currency_code ?? "KGS").toUpperCase().slice(0, 3)
                    : prev.currency_code,
              }));
            }}
          >
            <option value="">— выберите —</option>
            {products.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
                {p.sku ? ` (${p.sku})` : ""} — остаток {p.quantity}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1">
        <div className="text-xs">Количество</div>
        <Input
          inputMode="numeric"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Причина (справочник)</div>
        <select
          aria-label="Причина списания"
          className={selectClass}
          value={form.reason_id}
          onChange={(e) => setForm((p) => ({ ...p, reason_id: e.target.value }))}
        >
          <option value="">— не указана —</option>
          {reasons.map((r) => (
            <option key={r.id} value={String(r.id)}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <div className="text-xs">Пояснение / текст причины</div>
        <Input
          value={form.reason_text}
          onChange={(e) => setForm((p) => ({ ...p, reason_text: e.target.value }))}
          placeholder="Дополнительно к выбранной причине"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="text-xs">Цена на момент списания</div>
          <Input
            inputMode="decimal"
            value={form.price_at_writeoff}
            onChange={(e) =>
              setForm((p) => ({ ...p, price_at_writeoff: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs">Валюта цены</div>
          <Input
            value={form.currency_code}
            maxLength={3}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                currency_code: e.target.value.toUpperCase().slice(0, 3),
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs">Номер документа</div>
        <Input
          value={form.document_number}
          onChange={(e) => setForm((p) => ({ ...p, document_number: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Дата списания</div>
        <Input
          type="date"
          value={form.writeoff_date}
          onChange={(e) => setForm((p) => ({ ...p, writeoff_date: e.target.value }))}
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
        <Button type="button" variant="outline" onClick={() => router.push("/writeoffs")}>
          Назад
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isCreate ? "Создать списание" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
