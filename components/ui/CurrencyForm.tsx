"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Currency = {
  id: number | null;
  code: string;
  symbol: string;
  name: string;
  is_base: boolean | null;
};

export function CurrencyForm({ currency }: { currency: Currency }) {
  const router = useRouter();
  const isCreate = currency.id === null;
  const initial = useMemo(
    () => ({
      code: (currency.code ?? "").toUpperCase(),
      symbol: currency.symbol ?? "",
      name: currency.name ?? "",
      is_base: Boolean(currency.is_base),
    }),
    [currency],
  );

  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [baseSwitchOpen, setBaseSwitchOpen] = useState(false);
  const [otherBaseLabel, setOtherBaseLabel] = useState<string | null>(null);
  const canSubmit =
    form.code.trim().length > 0 &&
    form.symbol.trim().length > 0 &&
    form.name.trim().length > 0;

  async function performSave() {
    const payload = {
      code: form.code.trim().toUpperCase(),
      symbol: form.symbol.trim(),
      name: form.name.trim(),
      is_base: form.is_base,
    };

    const res = isCreate
      ? await fetch("/api/currencies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/currencies/${currency.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сохранить изменения");
      return;
    }

    router.push("/currencies");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.is_base) {
      await performSave();
      return;
    }

    const infoRes = await fetch("/api/currencies", { cache: "no-store" });
    if (!infoRes.ok) {
      setError("Не удалось проверить текущую базовую валюту");
      return;
    }
    const info = await infoRes.json();
    const cur = info?.current as
      | { id: number; code: string; name: string }
      | null
      | undefined;

    if (!cur) {
      await performSave();
      return;
    }

    if (currency.id !== null && cur.id === currency.id) {
      await performSave();
      return;
    }

    setOtherBaseLabel(`${cur.code} — ${cur.name}`);
    setBaseSwitchOpen(true);
  }

  async function confirmBaseSwitch() {
    setBaseSwitchOpen(false);
    setOtherBaseLabel(null);
    await performSave();
  }

  return (
    <>
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <div className="space-y-1">
        <div className="text-xs">Код (ISO)</div>
        <Input
          value={form.code}
          maxLength={3}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              code: e.target.value.toUpperCase(),
            }))
          }
          placeholder="KGS"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Символ</div>
        <Input
          value={form.symbol}
          maxLength={5}
          onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value }))}
          placeholder="сом"
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs">Название</div>
        <Input
          value={form.name}
          maxLength={50}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Кыргызский сом"
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border"
          checked={form.is_base}
          onChange={(e) =>
            setForm((p) => ({ ...p, is_base: e.target.checked }))
          }
        />
        Базовая валюта
      </label>

      {error && <div className="text-xs text-red-600">{error}</div>}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/currencies")}
        >
          Назад
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isCreate ? "Создать" : "Сохранить"}
        </Button>
      </div>
    </form>

      <Dialog open={baseSwitchOpen} onOpenChange={setBaseSwitchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Смена базовой валюты</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Сейчас базовой считается{" "}
            <span className="font-medium text-foreground">{otherBaseLabel}</span>.
            После сохранения у неё снимется признак базовой, базовой станет эта
            запись.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBaseSwitchOpen(false);
                setOtherBaseLabel(null);
              }}
            >
              Отмена
            </Button>
            <Button type="button" onClick={() => void confirmBaseSwitch()}>
              Продолжить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
