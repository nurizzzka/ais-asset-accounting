import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SupplierForm } from "@/components/ui/SupplierForm";
import { suppliers } from "@/generated/prisma/client";
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupplierEditPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const supplier: suppliers | null = await prisma.suppliers.findUnique({
    where: { id },
  });

  if (!supplier) {
    return <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl text-center">Поставщик не найден</h1>
    </div>;
  }

  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Редактирование поставщика</h1>

      <SupplierForm supplier={supplier} />
    </div>
  );
}