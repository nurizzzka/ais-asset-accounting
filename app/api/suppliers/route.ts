import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function optString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
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

  const createdBy = await getCurrentUser();

  const created = await prisma.suppliers.create({
    data: {
      name,
      phone: optString(b.phone),
      email: optString(b.email),
      address: optString(b.address),
      inn: optString(b.inn),
      notes: optString(b.notes),
      created_by: createdBy,
    },
  });

  return NextResponse.json(created);
}
