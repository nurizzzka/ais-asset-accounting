import { prisma } from "@/lib/db";

export default async function Products() {
    const products = await prisma.products.findMany();
    return (
        <div>
            <h1 className="text-white text-3xl font-bold underline">Products</h1>
            <div>
                {products.map((product) => (
                    <div key={product.id}>
                        {product.name}
                    </div>
                ))}
            </div>
        </div>
    );
}