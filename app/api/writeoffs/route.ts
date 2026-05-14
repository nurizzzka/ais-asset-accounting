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

function totalAmountStr(qty: number, priceStr: string): string {
  const p = Number(priceStr);
  if (!Number.isFinite(p)) return "0";
  return (qty * p).toFixed(2);
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
  const productId = optInt(b.product_id);
  if (productId === null || productId <= 0) {
    return NextResponse.json({ error: "Выберите товар" }, { status: 400 });
  }

  const qty = optInt(b.quantity);
  if (qty === null || qty < 1) {
    return NextResponse.json(
      { error: "Количество должно быть не меньше 1" },
      { status: 400 },
    );
  }

  const product = await prisma.products.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  if (product.quantity < qty) {
    return NextResponse.json(
      {
        error: `Недостаточно остатка: на складе ${product.quantity}, запрошено ${qty}`,
      },
      { status: 400 },
    );
  }

  const reasonId = optInt(b.reason_id);
  const reasonText = optString(b.reason_text);
  const priceAt = decimalString(
    b.price_at_writeoff,
    product.price_kgs != null ? String(product.price_kgs) : "0",
  );
  const currency = (optString(b.currency_code) ?? product.purchase_currency_code ?? "KGS")
    .toUpperCase()
    .slice(0, 3);
  const documentNumber = optString(b.document_number);
  const writeoffDate = parseDateOnly(b.writeoff_date);
  const notes = optString(b.notes);
  const total = totalAmountStr(qty, priceAt);
  const createdBy = await getCurrentUser();

  try {
    const row = await prisma.$transaction(async (tx) => {
      const upd = await tx.products.updateMany({
        where: { id: productId, quantity: { gte: qty } },
        data: { quantity: { decrement: qty } },
      });
      if (upd.count !== 1) {
        throw new Error("STOCK");
      }

      return tx.writeoffs.create({
        data: {
          product_id: productId,
          quantity: qty,
          reason_id: reasonId && reasonId > 0 ? reasonId : null,
          reason_text: reasonText,
          price_at_writeoff: priceAt,
          currency_code: currency,
          total_amount: total,
          document_number: documentNumber,
          writeoff_date: writeoffDate,
          notes,
          created_by: createdBy,
        },
      });
    });

    return NextResponse.json(row);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "STOCK") {
      return NextResponse.json(
        { error: "Не удалось списать: остаток изменился, обновите страницу" },
        { status: 409 },
      );
    }
    throw e;
  }
}
