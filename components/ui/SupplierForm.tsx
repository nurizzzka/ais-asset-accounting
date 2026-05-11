"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Supplier = {
  id: number | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  inn: string | null;
  notes: string | null;
};

export function SupplierForm({ supplier }: { supplier: Supplier }) {
  const router = useRouter();
  const isCreate = supplier.id === null;
  const initial = useMemo(
    () => ({
      name: supplier.name ?? "",
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      inn: supplier.inn ?? "",
      notes: supplier.notes ?? "",
    }),
    [supplier],
  );

  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = form.name.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() ? form.phone.trim() : null,
      email: form.email.trim() ? form.email.trim() : null,
      address: form.address.trim() ? form.address.trim() : null,
      inn: form.inn.trim() ? form.inn.trim() : null,
      notes: form.notes.trim() ? form.notes.trim() : null,
    };

    const res = isCreate
      ? await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/suppliers/${supplier.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сохранить изменения");
      return;
    }

    router.push("/suppliers");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <div className="space-y-1">
        <div className="text-xs">Наименование</div>
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Например, ООО Ромашка"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Телефон</div>
        <Input
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="+996 ..."
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Email</div>
        <Input
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="name@example.com"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Адрес</div>
        <Input
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          placeholder="Адрес поставщика"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">ИНН</div>
        <Input
          value={form.inn}
          onChange={(e) => setForm((p) => ({ ...p, inn: e.target.value }))}
          placeholder="ИНН"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Примечание</div>
        <Input
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Доп. информация"
        />
      </div>

      {error && <div className="text-xs text-red-600">{error}</div>}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/suppliers")}
        >
          Назад
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isCreate ? "Создать" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}