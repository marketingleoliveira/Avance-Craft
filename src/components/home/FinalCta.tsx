import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { Button } from "@/components/ui/button";
import { Rocket, ShoppingCart, ChevronRight } from "lucide-react";
import landscape from "@/assets/voxel-landscape.jpg";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Cinematic Effects */}
      <div className="absolute inset-0 z-0">
        <img
          src={landscape}
          alt=""
          aria-hidden
          className="w-full h-full object-cover opacity-30 scale-110 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent" />
        <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay" />
      </div>

      <Container className="relative z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
            <Rocket className="w-4 h-4" />
            Pronto para o Desafio?
          </div>
          
          <h2 className="text-5xl md:text-8xl font-[900] tracking-[-0.04em] uppercase italic text-white leading-[0.9]">
            A Forja das <br />
            <span className="text-emerald-500">Lendas</span> Espera
          </h2>
          
          <p className="text-stone-400 font-medium text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
            Sua jornada épica começa agora.
          </p>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl inline-block group cursor-pointer hover:border-emerald-500/30 transition-all">
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">Endereço de Conexão</span>
            <span className="text-2xl md:text-4xl font-[900] text-white uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">
              jogar.avance.com.br
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="h-20 px-12 rounded-2xl text-lg group w-full sm:w-auto">
              Jogar Agora
              <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" asChild className="h-20 px-12 rounded-2xl text-lg w-full sm:w-auto border-white/10 hover:bg-white/5">
              <Link to="/loja" className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                Loja Oficial
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
