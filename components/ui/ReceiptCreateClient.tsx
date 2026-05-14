"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductIntakeForm } from "@/components/ui/ProductIntakeForm";
import { ReceiptForm, type ReceiptFormProduct, type ReceiptFormValues } from "@/components/ui/ReceiptForm";
import type { ProductFormSupplier } from "@/components/ui/ProductForm";

type Props = {
  products: ReceiptFormProduct[];
  suppliers: ProductFormSupplier[];
  defaultReceiptDate: string;
  receiptDefaults: ReceiptFormValues;
};

export function ReceiptCreateClient({
  products,
  suppliers,
  defaultReceiptDate,
  receiptDefaults,
}: Props) {
  const [mode, setMode] = useState<"catalog" | "new">("catalog");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "catalog" ? "secondary" : "outline"}
          onClick={() => setMode("catalog")}
        >
          Существующий товар
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "new" ? "secondary" : "outline"}
          onClick={() => setMode("new")}
        >
          Новая карточка и поступление
        </Button>
      </div>

      {mode === "catalog" ? (
        <ReceiptForm products={products} receipt={receiptDefaults} />
      ) : (
        <ProductIntakeForm
          suppliers={suppliers}
          cancelHref="/receipts"
          successHref="/receipts"
          submitLabel="Создать товар и поступление"
          defaultQuantity={1}
          defaultReceiptDate={defaultReceiptDate}
        />
      )}
    </div>
  );
}
