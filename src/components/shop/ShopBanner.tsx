import banner from "@/assets/shop-banner.jpg";
import { Container } from "@/components/ui-kit/Container";

/** Banner topo da loja. Imagem original em estilo voxel (placeholder). */
export function ShopBanner() {
  return (
    <section className="relative overflow-hidden border-b-4 border-dirt-dark">
      <img
        src={banner}
        alt="Ilustração voxel de uma barraca de comércio com baús e esmeraldas"
        width={1536}
        height={640}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute inset-0 bg-dirt-dark/55" aria-hidden />
      <Container className="relative py-12 sm:py-16">
        <p className="font-pixel text-[10px] uppercase text-emerald-block">
          Loja oficial
        </p>
        <h1 className="font-pixel text-outline mt-4 text-xl uppercase text-parchment sm:text-3xl">
          Loja do Avance
        </h1>
        <p className="mt-4 max-w-xl text-sm font-semibold text-parchment/90 sm:text-base">
          Apoie o servidor e leve vantagens cosméticas e de conforto. Entrega automática
          no seu nick após a confirmação.
        </p>
        <p className="mt-3 inline-block bg-dirt-dark/80 px-3 py-2 text-xs font-bold uppercase text-parchment">
          Vitrine demonstrativa — nenhum pagamento está habilitado
        </p>
      </Container>
    </section>
  );
}
