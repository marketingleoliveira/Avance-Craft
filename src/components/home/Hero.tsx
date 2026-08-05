import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { Play, MessageSquare, Monitor, Smartphone, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import landscape from "@/assets/voxel-landscape.jpg";
import charPickaxe from "@/assets/hero-char-pickaxe.png";

export function Hero({ settings }: { settings?: Record<string, string> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-stone-950">
      {/* Cinematic Background - The Map */}
      <div className="absolute inset-0 z-0">
        <img
          src={landscape}
          alt="Avance World Map"
          className="h-full w-full object-cover opacity-30 scale-110 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-stone-950/80" />
      </div>

      {/* Hero Content Layer */}
      <Container className="relative z-20 pt-20">
        <div className="flex flex-col items-center text-center">
          {/* Main Logo / Title */}
          <div className="space-y-6 mb-12">
            <h1 className="text-9xl md:text-[14rem] font-[900] tracking-[-0.05em] text-white uppercase italic leading-[0.75] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-1000">
              Avance
            </h1>
            <div className="h-2 w-48 bg-emerald-500 mx-auto rounded-full shadow-[0_0_30px_rgba(16,185,129,0.6)]" />
          </div>

          {/* Headlines */}
          <div className="max-w-4xl space-y-8 mb-16">
            <h2 className="text-4xl md:text-7xl font-[900] text-white tracking-[-0.03em] leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 uppercase">
              O PRÓXIMO NÍVEL DO <span className="text-emerald-500">SURVIVAL</span>
            </h2>
            <p className="text-xl md:text-2xl text-stone-400 font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              Uma experiência definitiva. Tecnologia de ponta, economia real e aventuras épicas.
            </p>
          </div>

          {/* Action Buttons (CTAs) */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <button className="group relative px-12 py-6 bg-emerald-500 text-stone-950 font-black uppercase tracking-widest text-sm transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] active:scale-95 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
              <span className="relative flex items-center gap-3">
                <Play className="w-5 h-5 fill-current" />
                Jogar Agora
              </span>
            </button>

            <button className="group px-12 py-6 border-2 border-white/10 text-white font-bold uppercase tracking-widest text-sm hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              Entrar no Discord
            </button>
          </div>

          {/* Minimalist Status Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center px-12 py-8 bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
            <StatusItem icon={Zap} label="Status" value="Online" color="text-emerald-500" />
            <StatusItem icon={Users} label="Jogadores" value="2.4k+" />
            <StatusItem icon={Monitor} label="Java" value="1.21+" />
            <StatusItem icon={Smartphone} label="Bedrock" value="Ativo" />
          </div>
        </div>
      </Container>

      {/* Large Single Character - Behind Text Layer */}
      <div className="absolute bottom-0 right-[-10%] z-10 opacity-60 pointer-events-none hidden lg:block">
        <img
          src={charPickaxe}
          alt="Hero Character"
          className="h-[100vh] w-auto object-contain translate-y-20 filter brightness-75 contrast-125"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </section>
  );
}

function StatusItem({ icon: Icon, label, value, color = "text-white" }: { icon: any, label: string, value: string, color?: string }) {
  return (
    <div className="flex flex-col items-center md:items-start gap-1">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <span className={cn("text-lg font-black tracking-tight", color)}>{value}</span>
    </div>
  );
}
