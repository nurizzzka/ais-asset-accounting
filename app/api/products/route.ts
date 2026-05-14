import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function optString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function optInt(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return null;
}

function reqPositiveInt(v: unknown, fallback: number): number {
  const n = optInt(v);
  if (n === null || n < 0) return fallback;
  return n;
}

function decimalString(v: unknown, fallback: string): string {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "string") {
    const t = v.trim().replace(",", ".");
    if (t === "") return fallback;
    const n = Number(t);
    if (!Number.isFinite(n)) return fallback;
    return t;
  }
  return fallback;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Неверное тело запроса" },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Неверное тело запроса" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "Наименование обязательно" },
      { status: 400 },
    );
  }

  const quantity = reqPositiveInt(b.quantity, 0);
  const supplierId = optInt(b.supplier_id);
  const minQty = optInt(b.min_quantity);
  const unit = optString(b.unit) ?? "шт";
  const sku = optString(b.sku);
  const notes = optString(b.notes);
  const purchaseCurrency = (optString(b.purchase_currency_code) ?? "KGS").toUpperCase();
  const priceKgs = decimalString(b.price_kgs, "0");
  const purchaseOriginal = decimalString(b.purchase_price_original, priceKgs);
  const exchangeRate = decimalString(b.exchange_rate_at_purchase, "1");

  const createdBy = await getCurrentUser();

  try {
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.products.create({
        data: {
          name,
          sku,
          supplier_id: supplierId && supplierId > 0 ? supplierId : null,
          quantity,
          min_quantity: minQty !== null && minQty >= 0 ? minQty : 0,
          unit,
          price_kgs: priceKgs,
          purchase_currency_code: purchaseCurrency,
          purchase_price_original: purchaseOriginal,
          exchange_rate_at_purchase: exchangeRate,
          notes,
        },
      });

      if (quantity > 0) {
        await tx.receipts.create({
          data: {
            product_id: p.id,
            quantity,
            price_original: purchaseOriginal,
            currency_code: purchaseCurrency,
            exchange_rate: exchangeRate,
            created_by: createdBy,
            notes: "Первичное поступление при создании карточки",
          },
        });
      }

      return p;
    });

    return NextResponse.json(product);
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? (e as { code?: string }).code
        : undefined;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Артикул уже занят другим товаром" },
        { status: 409 },
      );
    }
    throw e;
  }
}
