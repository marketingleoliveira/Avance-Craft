import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { formatBRL } from "@/lib/utils/format";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Star, ShieldCheck, Zap } from "lucide-react";

import chests from "@/assets/vip-chests.png";

function ChestImage({ index, name }: { index: number; name: string }) {
  return (
    <div className="relative h-48 overflow-hidden rounded-2xl bg-stone-900/50 flex items-center justify-center border border-white/5 group-hover:border-emerald-500/20 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent z-10" />
      <img
        src={chests}
        alt={`Baú voxel representando o ${name}`}
        width={1536}
        height={640}
        loading="lazy"
        className="h-full w-[300%] max-w-none object-contain transition-transform duration-700 group-hover:scale-110"
        style={{ transform: `translateX(-${(index % 3) * 33.3333}%)` }}
      />
    </div>
  );
}

export function ShopHighlight({ products }: { products: any[] }) {
  return (
    <section className="relative overflow-hidden" id="shop">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px]">
              <Star className="w-3 h-3" />
              Upgrade sua jornada
            </div>
            <h2 className="text-4xl md:text-6xl font-[900] tracking-[-0.03em] uppercase italic text-white">
              Vips em <span className="text-emerald-500">Destaque</span>
            </h2>
            <p className="text-stone-400 font-medium text-lg max-w-xl">
              Alcance o status lendário e desbloqueie benefícios exclusivos no Avance.
            </p>
          </div>
          <Link to="/loja" className="hidden md:flex items-center gap-2 text-stone-400 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors">
            Ver loja completa <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {products.map((product: any, index: number) => (
            <Card key={product.id} className="p-6 flex flex-col">
              <div className="absolute top-4 right-4 z-20">
                <span className="px-3 py-1 bg-emerald-500 text-stone-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                  {product.category?.name || "VIP"}
                </span>
              </div>
              
              <ChestImage index={index} name={product.name} />
              
              <div className="mt-8 flex-1">
                <h3 className="text-2xl font-[900] uppercase italic tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-stone-500 font-bold uppercase tracking-widest text-[10px]">
                  <Zap className="w-3 h-3" />
                  {product.duration_days ? `${product.duration_days} dias` : "Permanente"}
                </div>
                
                <ul className="mt-8 space-y-3">
                  {product.benefits?.slice(0, 3).map((benefit: any) => (
                    <li key={benefit.id} className="flex items-start gap-3 text-stone-400 text-sm font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {benefit.description}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 italic">Investimento</span>
                  <span className="text-3xl font-[900] text-white tracking-tighter">
                    {formatBRL(Math.round(product.price * 100))}
                  </span>
                </div>
                <Link to="/loja" className="bg-white text-stone-950 px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-xl shadow-black/20">
                  Comprar
                </Link>
              </div>
            </Card>
          ))}
        </div>
        
        <Link to="/loja" className="mt-12 md:hidden flex items-center justify-center gap-2 text-stone-400 font-bold uppercase tracking-widest text-xs">
          Ver loja completa <ShoppingBag className="w-4 h-4" />
        </Link>
      </Container>
    </section>
  );
}
