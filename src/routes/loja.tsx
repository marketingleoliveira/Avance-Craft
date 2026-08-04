import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { CartProvider, useCart } from "@/components/shop/CartContext";
import { ShopBanner } from "@/components/shop/ShopBanner";
import { PlayerIdentity } from "@/components/shop/PlayerIdentity";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductDialog } from "@/components/shop/ProductDialog";
import { CartPanel } from "@/components/shop/CartPanel";
import { ShopFaq, ShopTerms } from "@/components/shop/ShopInfo";
import { SHOP_CATEGORIES, SHOP_PRODUCTS, type ShopCategoryId, type ShopProduct } from "@/data/shop";

const title = "Loja do Habblet Mine — VIPs, Cash, Kits e Passe";
const description =
  "Vitrine da loja do servidor brasileiro Habblet Mine: VIPs, cash, chaves, kits, cosméticos e passe de temporada com entrega no seu nick.";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <CartProvider>
      <ShopPage />
    </CartProvider>
  ),
});

function ShopPage() {
  const cart = useCart();
  const [category, setCategory] = useState<ShopCategoryId>("vips");
  const [selected, setSelected] = useState<ShopProduct | null>(null);
  const [open, setOpen] = useState(false);

  const products = useMemo(
    () => SHOP_PRODUCTS.filter((product) => product.category === category),
    [category],
  );
  const activeCategory = SHOP_CATEGORIES.find((item) => item.id === category);

  function addToCart(product: ShopProduct, quantity = 1) {
    if (!cart.nickname.trim()) {
      toast.error("Informe seu nick antes de adicionar itens.");
      return;
    }
    cart.add(product.id, quantity);
    toast.success(`${product.name} adicionado ao carrinho.`);
  }

  return (
    <main>
      <ShopBanner />

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-8">
            <PlayerIdentity />

            <div>
              <CategoryNav active={category} onChange={setCategory} />
              <p className="mt-3 text-sm text-muted-foreground">
                {activeCategory?.description}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={(item) => addToCart(item)}
                  onDetails={(item) => {
                    setSelected(item);
                    setOpen(true);
                  }}
                />
              ))}
            </div>
          </div>

          <aside aria-label="Carrinho de compras">
            <CartPanel />
          </aside>
        </div>
      </Container>

      <section className="bg-dirt/15 border-y-4 border-dirt-dark py-12">
        <Container>
          <WoodSign subtitle="Tudo o que você precisa saber antes de comprar.">
            Ajuda
          </WoodSign>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <ShopFaq />
            <ShopTerms />
          </div>
        </Container>
      </section>

      <ProductDialog
        product={selected}
        open={open}
        onOpenChange={setOpen}
        onAdd={(item, quantity) => addToCart(item, quantity)}
      />
    </main>
  );
}
