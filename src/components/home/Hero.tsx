import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Play, ChevronRight, Shield, Swords, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

import landscape from "@/assets/voxel-landscape.jpg";

export function Hero({ settings }: { settings?: Record<string, string> }) {
  const HERO_STATS = [
    { label: "Jogadores", value: "2.4k+", icon: Globe },
    { label: "Versão", value: settings?.["server_version"] || "1.21+", icon: Shield },
    { label: "Ping BR", value: "15ms", icon: Swords },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-950">
      {/* Background Cinematográfico */}
      <div className="absolute inset-0 z-0">
        <img
          src={landscape}
          alt="Paisagem voxel"
          className="h-full w-full object-cover opacity-40 scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/80 to-stone-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Partículas / Efeitos Visuais */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <Container className="relative z-10 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Badge Superior */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              Servidor Brasileiro Oficial
            </span>
          </div>

          {/* Título AAA */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white uppercase italic leading-none animate-in fade-in zoom-in-95 duration-1000">
              Avance
              <span className="block text-emerald-500 text-stroke-sm">Next Gen</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 delay-300 duration-1000">
              Explore um universo Survival reimaginado com tecnologia de ponta, 
              economia estável e uma comunidade apaixonada. O futuro do Minecraft é aqui.
            </p>
          </div>

          {/* Ações Minimalistas */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 delay-500 duration-1000">
            <button className="group relative px-10 py-5 bg-emerald-500 text-stone-950 font-black uppercase tracking-widest text-sm transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-95 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
              <span className="relative flex items-center gap-3">
                <Play className="w-5 h-5 fill-current" />
                Iniciar Jornada
              </span>
            </button>

            <Link 
              to="/loja"
              className="px-10 py-5 border border-white/10 text-white font-bold uppercase tracking-widest text-sm hover:bg-white/5 transition-all flex items-center gap-2"
            >
              Ver Coleções
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          </div>

          {/* Stats Cinematográficos */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-12 delay-700 duration-1000">
            {HERO_STATS.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
                <stat.icon className="w-5 h-5 text-emerald-500/50 mb-1" />
                <span className="text-2xl font-black text-white tracking-tight">{stat.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
      
      {/* Gradiente de Transição Inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-stone-950 to-transparent z-10" />
    </section>
  );
}
