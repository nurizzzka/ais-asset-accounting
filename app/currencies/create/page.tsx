import { CurrencyForm } from "@/components/ui/CurrencyForm";

export default function CurrencyCreatePage() {
  return (
    <div className="px-2 py-4 space-y-4">
      <h1 className="text-2xl">Создание валюты</h1>
      <CurrencyForm
        currency={{
          id: null,
          code: "",
          symbol: "",
          name: "",
          is_base: false,
        }}
      />
    </div>
  );
}
