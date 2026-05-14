import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function optString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function parseBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  return undefined;
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
  const keys = Object.keys(b);

  const existing = await prisma.currencies.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Валюта не найдена" }, { status: 404 });
  }

  if (keys.length === 1 && keys[0] === "is_active") {
    const nextActive = b.is_active;
    if (typeof nextActive === "boolean") {
      const updated = await prisma.currencies.update({
        where: { id },
        data: { is_active: nextActive },
      });
      return NextResponse.json(updated);
    }
  }

  const codeRaw = typeof b.code === "string" ? b.code.trim().toUpperCase() : "";
  if (!codeRaw || codeRaw.length > 3) {
    return NextResponse.json(
      { error: "Код валюты обязателен (до 3 символов)" },
      { status: 400 },
    );
  }

  const symbol = optString(b.symbol);
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!symbol || symbol.length > 5) {
    return NextResponse.json(
      { error: "Символ обязателен (до 5 символов)" },
      { status: 400 },
    );
  }
  if (!name || name.length > 50) {
    return NextResponse.json(
      { error: "Название обязательно (до 50 символов)" },
      { status: 400 },
    );
  }

  const isBase = parseBool(b.is_base);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (isBase === true) {
        await tx.currencies.updateMany({
          where: { id: { not: id } },
          data: { is_base: false },
        });
      }
      return tx.currencies.update({
        where: { id },
        data: {
          code: codeRaw,
          symbol,
          name,
          ...(isBase !== undefined ? { is_base: isBase } : {}),
          ...(typeof b.is_active === "boolean" ? { is_active: b.is_active } : {}),
        },
      });
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? (e as { code: string }).code : "";
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Валюта с таким кодом уже существует" },
        { status: 409 },
      );
    }
    throw e;
  }
}
