"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReceiptFormProduct = {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  purchase_price_original: string | null;
  purchase_currency_code: string | null;
  exchange_rate_at_purchase: string | null;
  supplier_id: number | null;
  supplier_name: string | null;
};

export type ReceiptFormValues = {
  id: number | null;
  product_id: number;
  product_label: string;
  quantity: number;
  price_original: string;
  currency_code: string;
  exchange_rate: string;
  document_number: string | null;
  receipt_date: string | null;
  notes: string | null;
};

function productLabel(p: ReceiptFormProduct): string {
  return `${p.name}${p.sku ? ` (${p.sku})` : ""}`;
}

/** Поступление по существующему товару или редактирование строки поступления. */
export function ReceiptForm({
  receipt,
  products,
}: {
  receipt: ReceiptFormValues;
  products: ReceiptFormProduct[];
}) {
  const router = useRouter();
  const isCreate = receipt.id === null;

  const initial = useMemo(
    () => ({
      quantity: String(receipt.quantity ?? 1),
      price_original: receipt.price_original || "0",
      exchange_rate: receipt.exchange_rate || "1",
      currency_code: (receipt.currency_code ?? "KGS").toUpperCase().slice(0, 3),
      document_number: receipt.document_number ?? "",
      receipt_date: receipt.receipt_date ?? "",
      notes: receipt.notes ?? "",
    }),
    [receipt],
  );

  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productListOpen, setProductListOpen] = useState(false);
  const productFieldRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (q === "") {
      return products.slice(0, 12);
    }
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku != null && p.sku.toLowerCase().includes(q)),
      )
      .slice(0, 20);
  }, [products, productQuery]);

  const pickProduct = (p: ReceiptFormProduct) => {
    setSelectedProductId(p.id);
    setProductQuery(productLabel(p));
    setProductListOpen(false);
    setForm((prev) => ({
      ...prev,
      price_original:
        p.purchase_price_original != null ? String(p.purchase_price_original) : "0",
      exchange_rate:
        p.exchange_rate_at_purchase != null ? String(p.exchange_rate_at_purchase) : "1",
      currency_code: (p.purchase_currency_code ?? "KGS").toUpperCase().slice(0, 3),
    }));
  };

  useEffect(() => {
    if (!productListOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const el = productFieldRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setProductListOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [productListOpen]);

  const qty = Math.max(0, Math.trunc(Number(form.quantity.replace(",", ".")) || 0));
  const er = Number(form.exchange_rate.trim().replace(",", "."));
  const catalogOk =
    isCreate && selectedProductId != null && selectedProductId > 0;
  const canSubmit = isCreate
    ? catalogOk &&
      qty >= 1 &&
      form.price_original.trim() !== "" &&
      form.currency_code.trim().length >= 1 &&
      Number.isFinite(er) &&
      er > 0
    : qty >= 1 &&
      form.price_original.trim() !== "" &&
      form.currency_code.trim().length >= 1 &&
      Number.isFinite(er) &&
      er > 0;

  const selectedCatalogProduct =
    selectedProductId != null ? products.find((p) => p.id === selectedProductId) : undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (qty < 1) {
      setError("Количество не меньше 1");
      return;
    }

    const priceOrig = form.price_original.trim().replace(",", ".") || "0";
    const exRate = form.exchange_rate.trim().replace(",", ".") || "1";
    const currency = form.currency_code.trim().toUpperCase().slice(0, 3) || "KGS";

    const receiptCommon = {
      quantity: qty,
      price_original: priceOrig,
      exchange_rate: exRate,
      currency_code: currency,
      document_number: form.document_number.trim() ? form.document_number.trim() : null,
      receipt_date: form.receipt_date.trim() ? form.receipt_date.trim() : null,
      notes: form.notes.trim() ? form.notes.trim() : null,
    };

    let res: Response;
    if (!isCreate) {
      res = await fetch(`/api/receipts/${receipt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptCommon),
      });
    } else {
      const productId = selectedProductId;
      if (productId == null || productId <= 0) {
        setError("Выберите товар из списка");
        return;
      }
      res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...receiptCommon,
          product_id: productId,
        }),
      });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сохранить");
      return;
    }

    router.push("/receipts");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      {!isCreate && (
        <div className="space-y-1">
          <div className="text-xs">Товар</div>
          <div className="text-sm border border-input px-2.5 py-1.5 bg-muted/30">
            {receipt.product_label}
          </div>
        </div>
      )}

      {isCreate && (
        <div className="space-y-1" ref={productFieldRef}>
          <label htmlFor="receipt-product-search" className="text-xs">
            Товар из каталога
          </label>
          <div className="relative">
            <Input
              id="receipt-product-search"
              aria-haspopup="listbox"
              aria-expanded={productListOpen}
              aria-controls="receipt-product-suggestions"
              autoComplete="off"
              placeholder="Название или артикул — выберите из подсказок"
              value={productQuery}
              onChange={(e) => {
                setProductQuery(e.target.value);
                setSelectedProductId(null);
                setProductListOpen(true);
              }}
              onFocus={() => setProductListOpen(true)}
            />
            {productListOpen && (
              <div
                id="receipt-product-suggestions"
                className={cn(
                  "absolute z-50 mt-0.5 max-h-60 w-full overflow-auto border border-input bg-popover text-popover-foreground shadow-md",
                )}
              >
                {filteredProducts.length === 0 ? (
                  <div className="px-2.5 py-2 text-xs text-muted-foreground">
                    Ничего не найдено — создайте карточку через «Новая карточка и поступление»
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="flex w-full flex-col items-start gap-0.5 border-b border-border px-2.5 py-2 text-left text-xs last:border-b-0 hover:bg-accent"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickProduct(p)}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground">
                        {p.sku ? `${p.sku} · ` : ""}
                        остаток {p.quantity}
                        {p.supplier_name ? ` · ${p.supplier_name}` : ""}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {selectedProductId == null && productQuery.trim() !== "" && (
            <p className="text-xs text-muted-foreground">
              Выберите строку из списка — поступление привязывается к карточке товара
            </p>
          )}
          {selectedCatalogProduct != null && (
            <p className="text-xs text-muted-foreground">
              Поставщик в карточке:{" "}
              <span className="text-foreground">
                {selectedCatalogProduct.supplier_name ?? "—"}
              </span>
            </p>
          )}
        </div>
      )}

      <div className="space-y-1">
        <div className="text-xs">Количество (увеличит остаток на складе)</div>
        <Input
          inputMode="numeric"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="text-xs">Цена закупки (в валюте)</div>
          <Input
            inputMode="decimal"
            value={form.price_original}
            onChange={(e) =>
              setForm((p) => ({ ...p, price_original: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs">Валюта</div>
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
        <div className="text-xs">Курс к сому (умножение цены в валюте)</div>
        <Input
          inputMode="decimal"
          value={form.exchange_rate}
          onChange={(e) => setForm((p) => ({ ...p, exchange_rate: e.target.value }))}
        />
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
        <div className="text-xs">Примечание</div>
        <Input
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        />
      </div>

      {error && <div className="text-xs text-red-600">{error}</div>}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push("/receipts")}>
          Назад
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isCreate ? "Зарегистрировать поступление" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
