import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function optString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
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

  const existing = await prisma.suppliers.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Поставщик не найден" }, { status: 404 });
  }

  if (keys.length === 1 && keys[0] === "is_active") {
    const nextActive = b.is_active;
    if (typeof nextActive === "boolean") {
      const updated = await prisma.suppliers.update({
        where: { id },
        data: { is_active: nextActive },
      });
      return NextResponse.json(updated);
    }
  }

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "Наименование обязательно" },
      { status: 400 },
    );
  }

  const updated = await prisma.suppliers.update({
    where: { id },
    data: {
      name,
      phone: optString(b.phone),
      email: optString(b.email),
      address: optString(b.address),
      inn: optString(b.inn),
      notes: optString(b.notes),
      ...(typeof b.is_active === "boolean" ? { is_active: b.is_active } : {}),
    },
  });

  return NextResponse.json(updated);
}
