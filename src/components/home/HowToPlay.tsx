import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Server, PlayCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    step: "01",
    title: "Inicie o Game",
    text: "Abra seu Minecraft (Java ou Bedrock) na versão 1.20.x ou superior.",
    icon: Monitor,
  },
  {
    step: "02",
    title: "Conecte-se",
    text: "Adicione o IP jogar.avance.com.br na sua lista de servidores multijogador.",
    icon: Server,
  },
  {
    step: "03",
    title: "Divirta-se",
    text: "Crie sua conta, escolha um modo no lobby e comece sua jornada épica.",
    icon: PlayCircle,
  },
];

export function HowToPlay() {
  return (
    <section className="relative overflow-hidden" id="how-to-play">
      <Container>
        <div className="space-y-4 mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-[900] tracking-[-0.03em] uppercase italic text-white"
          >
            Prepare sua <span className="text-emerald-500">Jornada</span>
          </motion.h2>
          <p className="text-stone-400 font-medium text-lg max-w-xl mx-auto">
            Comece sua jornada em minutos.
          </p>
        </div>

        <ol className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.step} className="group relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: parseInt(step.step) * 0.1 }}
              >
                <Card className="p-10 h-full !rounded-[2.5rem] hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-stone-950 transition-all">
                      <step.icon className="w-8 h-8" />
                    </div>
                    <span className="text-5xl font-[900] italic text-white/5 group-hover:text-emerald-500/10 transition-colors">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-2xl font-[900] uppercase italic tracking-tight text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-stone-400 text-sm font-medium leading-relaxed">
                    {step.text}
                  </p>
                </Card>
              </motion.div>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex justify-center">
          <Button asChild variant="outline" className="h-16 px-12 rounded-2xl group">
            <Link to="/como-jogar" className="flex items-center gap-3">
              Ver Guia Completo para Iniciantes
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
