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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json(
      { error: "Некорректный идентификатор" },
      { status: 400 },
    );
  }

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

  const existing = await prisma.products.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  const supplierId = optInt(b.supplier_id);
  const minQty = optInt(b.min_quantity);
  const unit = optString(b.unit) ?? "шт";
  const sku = optString(b.sku);
  const notes = optString(b.notes);
  const purchaseCurrency = (optString(b.purchase_currency_code) ?? "KGS").toUpperCase();
  const priceKgs = decimalString(b.price_kgs, "0");
  const purchaseOriginal = decimalString(b.purchase_price_original, priceKgs);
  const exchangeRate = decimalString(b.exchange_rate_at_purchase, "1");

  try {
    const updated = await prisma.products.update({
      where: { id },
      data: {
        name,
        sku,
        supplier_id: supplierId && supplierId > 0 ? supplierId : null,
        min_quantity: minQty !== null && minQty >= 0 ? minQty : 0,
        unit,
        price_kgs: priceKgs,
        purchase_currency_code: purchaseCurrency,
        purchase_price_original: purchaseOriginal,
        exchange_rate_at_purchase: exchangeRate,
        notes,
      },
    });
    return NextResponse.json(updated);
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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json(
      { error: "Некорректный идентификатор" },
      { status: 400 },
    );
  }

  const product = await prisma.products.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  if (product.quantity <= 0) {
    return NextResponse.json(
      { error: "Нет остатка для списания" },
      { status: 400 },
    );
  }

  let requestedQty = 1;
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null) {
      const q = optInt((body as Record<string, unknown>).quantity);
      if (q !== null && q >= 1) requestedQty = q;
    }
  } catch {
    /* пустое тело — по умолчанию 1 */
  }

  if (requestedQty > product.quantity) {
    return NextResponse.json(
      {
        error: `Нельзя списать ${requestedQty} шт.: на остатке только ${product.quantity}`,
      },
      { status: 400 },
    );
  }

  const qty = requestedQty;
  const priceAt =
    product.price_kgs != null ? String(product.price_kgs) : "0";
  const currency =
    product.purchase_currency_code?.trim().toUpperCase() || "KGS";
  const total = (Number(priceAt) * qty).toFixed(2);
  const createdBy = await getCurrentUser();
  const newQty = product.quantity - qty;

  await prisma.$transaction([
    prisma.writeoffs.create({
      data: {
        product_id: id,
        quantity: qty,
        price_at_writeoff: priceAt,
        currency_code: currency,
        total_amount: total,
        reason_text:
          qty >= product.quantity
            ? "Списание остатка (действие «Удалить»)"
            : `Частичное списание (действие «Удалить», ${qty} шт.)`,
        created_by: createdBy,
      },
    }),
    prisma.products.update({
      where: { id },
      data: { quantity: newQty },
    }),
  ]);

  return NextResponse.json({ ok: true, quantityWrittenOff: qty, quantityLeft: newQty });
}
