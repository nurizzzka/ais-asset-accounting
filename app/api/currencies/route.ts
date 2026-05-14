import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const current = await prisma.currencies.findFirst({
    where: { is_base: true },
    select: { id: true, code: true, name: true },
  });
  return NextResponse.json({ current });
}

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
    const created = await prisma.$transaction(async (tx) => {
      if (isBase === true) {
        await tx.currencies.updateMany({ data: { is_base: false } });
      }
      return tx.currencies.create({
        data: {
          code: codeRaw,
          symbol,
          name,
          ...(isBase !== undefined ? { is_base: isBase } : {}),
        },
      });
    });
    return NextResponse.json(created);
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
