import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
  const newQty = optInt(b.quantity);
  if (newQty === null || newQty < 1) {
    return NextResponse.json(
      { error: "Количество должно быть не меньше 1" },
      { status: 400 },
    );
  }

  const priceOriginal = decimalString(b.price_original, "0");
  const exchangeRate = decimalString(b.exchange_rate, "1");
  const erNum = Number(exchangeRate);
  if (!Number.isFinite(erNum) || erNum <= 0) {
    return NextResponse.json(
      { error: "Курс к сому должен быть больше 0" },
      { status: 400 },
    );
  }

  const currency = (optString(b.currency_code) ?? "KGS").toUpperCase().slice(0, 3);
  const documentNumber = optString(b.document_number);
  const receiptDate = parseDateOnly(b.receipt_date);
  const notes = optString(b.notes);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.receipts.findUnique({ where: { id } });
      if (!existing) {
        return null;
      }

      const product = await tx.products.findUnique({
        where: { id: existing.product_id },
      });
      if (!product) {
        throw new Error("NO_PRODUCT");
      }

      const delta = newQty - existing.quantity;
      const nextStock = product.quantity + delta;
      if (nextStock < 0) {
        throw new Error("INSUFFICIENT");
      }

      await tx.products.update({
        where: { id: existing.product_id },
        data: { quantity: nextStock },
      });

      return tx.receipts.update({
        where: { id },
        data: {
          quantity: newQty,
          price_original: priceOriginal,
          currency_code: currency,
          exchange_rate: exchangeRate,
          document_number: documentNumber,
          receipt_date: receiptDate,
          notes,
        },
      });
    });

    if (updated === null) {
      return NextResponse.json({ error: "Поступление не найдено" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (e.message === "INSUFFICIENT") {
        return NextResponse.json(
          {
            error:
              "Недостаточно остатка товара: уменьшите количество в поступлении или скорректируйте списания",
          },
          { status: 400 },
        );
      }
      if (e.message === "NO_PRODUCT") {
        return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
      }
    }
    throw e;
  }
}
