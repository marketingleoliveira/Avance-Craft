import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listCategories, listProducts } from "@/lib/services/catalog.functions";
import { ShopBanner } from "@/components/shop/ShopBanner";
import { PlayerIdentity } from "@/components/shop/PlayerIdentity";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartPanel } from "@/components/shop/CartPanel";
import { ShopInfo } from "@/components/shop/ShopInfo";
import { useCart } from "@/components/shop/CartContext";

import { WoodSign } from "@/components/ui-kit/WoodSign";

export const Route = createFileRoute("/loja")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["categories"],
        queryFn: () => listCategories(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["products", { categorySlug: "" }],
        queryFn: () => listProducts({}),
      }),

    ]);
  },
  component: ShopPage,
});

function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { addToCart } = useCart();

  const { data: categories } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const { data: products } = useSuspenseQuery({
    queryKey: ["products", { categorySlug: selectedCategory }],
    queryFn: () => listProducts({ categorySlug: selectedCategory }),
  });

  return (
    <div className="min-h-screen pb-20">
      <ShopBanner />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <PlayerIdentity />

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <CategoryNav
              categories={categories.map((c) => ({ id: c.slug, label: c.name, description: c.description || "" }))}
              activeId={selectedCategory || categories[0]?.slug}
              onSelect={setSelectedCategory}
            />

            <div className="mt-8">
              <WoodSign className="mb-6">
                {categories.find(c => c.slug === (selectedCategory || categories[0]?.slug))?.name || "Produtos"}
              </WoodSign>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      category: (product.category?.slug as any) || "vips",
                      name: product.name,
                      shortDescription: product.short_description || "",
                      fullDescription: product.full_description || "",
                      perks: product.benefits.map(b => b.description),
                      commands: [],
                      priceCents: Math.round(product.price * 100),
                      previousPriceCents: product.promotional_price 
                        ? Math.round(product.promotional_price * 100) 
                        : undefined,
                      duration: product.duration_days ? `${product.duration_days} dias` : "Permanente",
                      platforms: ["java", "bedrock"],
                      art: (product.position % 3) as any // Mapeamento temporário para arte
                    }}
                    onBuy={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        priceCents: Math.round((product.promotional_price || product.price) * 100),
                        quantity: 1,
                      })
                    }
                  />
                ))}
                
                {products.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    Nenhum produto encontrado nesta categoria.
                  </div>
                )}
              </div>
            </div>
            
            <FAQSection />
          </div>

          <aside className="lg:w-80 shrink-0">
            <CartPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
