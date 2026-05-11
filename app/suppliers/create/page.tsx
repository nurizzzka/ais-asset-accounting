import { SupplierForm } from "@/components/ui/SupplierForm";

export default function SupplierCreatePage() {
  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Создание поставщика</h1>
      <SupplierForm
        supplier={{
          id: null,
          name: "",
          phone: null,
          email: null,
          address: null,
          inn: null,
          notes: null,
        }}
      />
    </div>
  );
}
