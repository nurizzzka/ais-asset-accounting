import { prisma } from "@/lib/db";

export default async function Currencies() {
    const currencies = await prisma.currencies.findMany();
    return (
        <div>
            <h1>Валюта</h1>
            <div>
                {currencies.map((currency) => (
                    <div key={currency.id}>
                        {currency.name}
                    </div>
                ))}
            </div>
        </div>
    );
}