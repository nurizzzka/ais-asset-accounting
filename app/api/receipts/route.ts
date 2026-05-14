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

function parseDateOnly(v: unknown): Date | null {
  const s = optString(v);
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
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
  const qty = optInt(b.quantity);
  if (qty === null || qty < 1) {
    return NextResponse.json(
      { error: "Количество должно быть не меньше 1" },
      { status: 400 },
    );
  }

  const documentNumber = optString(b.document_number);
  const receiptDate = parseDateOnly(b.receipt_date);
  const notes = optString(b.notes);
  const createdBy = await getCurrentUser();

  const productId = optInt(b.product_id);
  if (productId === null || productId <= 0) {
    return NextResponse.json({ error: "Выберите товар из каталога" }, { status: 400 });
  }

  const product = await prisma.products.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  const priceOriginal = decimalString(
    b.price_original,
    product.purchase_price_original != null
      ? String(product.purchase_price_original)
      : "0",
  );
  const exchangeRate = decimalString(
    b.exchange_rate,
    product.exchange_rate_at_purchase != null
      ? String(product.exchange_rate_at_purchase)
      : "1",
  );
  const erNum = Number(exchangeRate);
  if (!Number.isFinite(erNum) || erNum <= 0) {
    return NextResponse.json(
      { error: "Курс к сому должен быть больше 0" },
      { status: 400 },
    );
  }

  const currency = (optString(b.currency_code) ?? product.purchase_currency_code ?? "KGS")
    .toUpperCase()
    .slice(0, 3);

  const row = await prisma.$transaction(async (tx) => {
    await tx.products.update({
      where: { id: productId },
      data: { quantity: { increment: qty } },
    });

    return tx.receipts.create({
      data: {
        product_id: productId,
        quantity: qty,
        price_original: priceOriginal,
        currency_code: currency,
        exchange_rate: exchangeRate,
        document_number: documentNumber,
        receipt_date: receiptDate,
        notes,
        created_by: createdBy,
      },
    });
  });

  return NextResponse.json(row);
}
