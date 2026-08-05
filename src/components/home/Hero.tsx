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
    <section 
      ref={containerRef}
      className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-stone-950"
    >
      {/* Cinematic Background - The Map */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        <img
          src={landscape}
          alt="Avance World Map"
          className="h-full w-full object-cover opacity-30 scale-110 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-stone-950/80" />
      </motion.div>

      {/* Ambient Lighting Layers */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/0 via-stone-950/20 to-stone-950 z-10 pointer-events-none" />

      {/* Hero Content Layer */}
      <Container className="relative z-20 pt-20">
        <motion.div 
          style={{ y: y2, opacity }}
          className="flex flex-col items-center text-center"
        >
          {/* Main Logo / Title */}
          <div className="space-y-6 mb-12">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-9xl md:text-[14rem] font-[900] tracking-[-0.05em] text-white uppercase italic leading-[0.75] drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              Avance
            </motion.h1>
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "12rem", opacity: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              className="h-2 bg-emerald-500 mx-auto rounded-full shadow-[0_0_30px_rgba(16,185,129,0.6)]" 
            />
          </div>

          {/* Headlines */}
          <div className="max-w-4xl space-y-8 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-4xl md:text-7xl font-[900] text-white tracking-[-0.03em] leading-[1.1] uppercase"
            >
              O PRÓXIMO NÍVEL DO <span className="text-emerald-500">SURVIVAL</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-xl md:text-2xl text-stone-400 font-medium max-w-2xl mx-auto leading-relaxed"
            >
              Uma experiência definitiva. Tecnologia de ponta, economia real e aventuras épicas.
            </motion.p>
          </div>

          {/* Action Buttons (CTAs) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="flex flex-col sm:flex-row items-center gap-6 mb-24"
          >
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
          </motion.div>

          {/* Minimalist Status Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center px-12 py-8 bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl"
          >
            <StatusItem icon={Zap} label="Status" value="Online" color="text-emerald-500" />
            <StatusItem icon={Users} label="Jogadores" value="2.4k+" />
            <StatusItem icon={Monitor} label="Java" value="1.21+" />
            <StatusItem icon={Smartphone} label="Bedrock" value="Ativo" />
          </motion.div>
        </motion.div>
      </Container>

      {/* Large Single Character - Behind Text Layer */}
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 150]) }}
        className="absolute bottom-0 right-[-10%] z-10 opacity-60 pointer-events-none hidden lg:block"
      >
        <img
          src={charPickaxe}
          alt="Hero Character"
          className="h-[100vh] w-auto object-contain translate-y-20 filter brightness-75 contrast-125"
          style={{ imageRendering: "pixelated" }}
        />
      </motion.div>
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
