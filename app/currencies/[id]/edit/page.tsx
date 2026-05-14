import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CurrencyForm } from "@/components/ui/CurrencyForm";
import { currencies } from "@/generated/prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CurrencyEditPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const currency: currencies | null = await prisma.currencies.findUnique({
    where: { id },
  });

  if (!currency) {
    return (
      <div className="px-2 py-4 space-y-4">
        <h1 className="text-2xl text-center">Валюта не найдена</h1>
      </div>
    );
  }

  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Редактирование валюты</h1>
      <CurrencyForm currency={currency} />
    </div>
  );
}
