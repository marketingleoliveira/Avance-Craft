import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listCategories, listProducts } from "@/lib/services/catalog.functions";
import { ShopBanner } from "@/components/shop/ShopBanner";
import { PlayerIdentity } from "@/components/shop/PlayerIdentity";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartPanel } from "@/components/shop/CartPanel";
import { ShopFaq, ShopTerms } from "@/components/shop/ShopInfo";
import { useCart } from "@/components/shop/CartContext";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";


export const Route = createFileRoute("/loja")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["categories"],
        queryFn: () => listCategories(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["products", ""],
        queryFn: () => listProducts({ data: { categorySlug: "" } }),
      }),
    ]);
  },
  component: ShopPage,
});

function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const cart = useCart();

  const { data: categories, error: catError, refetch: refetchCats } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const { data: products, error: prodError, refetch: refetchProds } = useSuspenseQuery({
    queryKey: ["products", selectedCategory || ""],
    queryFn: () => listProducts({ data: { categorySlug: selectedCategory } }),
  });

  if (catError || prodError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <WoodSign className="mb-6">Ocorreu um erro</WoodSign>
        <p className="text-muted-foreground mb-8">Não foi possível carregar o catálogo. Por favor, tente novamente.</p>
        <button 
          onClick={() => { refetchCats(); refetchProds(); }}
          className="px-6 py-2 bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }


  return (
    <div className="min-h-screen pb-20">
      <ShopBanner />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <PlayerIdentity />

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <CategoryNav
              categories={categories.map((c) => ({ id: c.slug, label: c.name, description: c.description || "" }))}
              activeId={selectedCategory || categories[0]?.slug || ""}
              onSelect={setSelectedCategory}
            />

            <div className="mt-8">
              <WoodSign className="mb-6">
                {categories.find((c) => c.slug === (selectedCategory || categories[0]?.slug))?.name || "Produtos"}
              </WoodSign>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <StonePanel className="max-w-md mx-auto">
                      <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
                    </StonePanel>
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        category: (product.category?.slug as any) || "vips",
                        name: product.name,
                        shortDescription: product.short_description || "",
                        fullDescription: product.full_description || "",
                        perks: product.benefits?.map((b) => b.label) || [],
                        commands: [],
                        priceCents: Math.round(product.price * 100),
                        previousPriceCents: product.promotional_price !== null && product.promotional_price !== undefined
                          ? Math.round(product.promotional_price * 100) 
                          : undefined,
                        duration: product.duration_days ? `${product.duration_days} dias` : "Permanente",
                        platforms: ["java", "bedrock"],
                        art: (product.position % 3)
                      }}
                      onBuy={(p: any) => cart.add(p.id, 1, p)}
                    />
                  ))
                )}
              </div>

            </div>
            
            <div className="mt-12 grid gap-8">
              <ShopFaq />
              <ShopTerms />
            </div>
          </div>

          <aside className="lg:w-80 shrink-0">
            <CartPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
