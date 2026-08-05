import { Container } from "@/components/ui-kit/Container";
import { Card } from "@/components/ui/card";
import { Gamepad2, Layout, Boxes, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export function ModesSection({ modes }: { modes: any[] }) {
  const ICONS: Record<string, any> = {
    "Survival": Boxes,
    "Creative": Layout,
    "Minigames": Gamepad2,
    "Rankup": Trophy,
  };

  return (
    <section className="relative overflow-hidden" id="modes">
      <Container>
        <div className="space-y-4 mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-[900] tracking-[-0.03em] uppercase italic text-white"
          >
            Nossos <span className="text-emerald-500">Mundos</span>
          </motion.h2>
          <p className="text-stone-400 font-medium text-lg max-w-xl mx-auto">
            Escolha sua aventura.
          </p>
        </div>

        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {modes.map((mode: any) => {
            const Icon = ICONS[mode.name] || Boxes;
            return (
              <motion.div
                key={mode.id}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1 }
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="p-8 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-stone-950 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={
                        mode.available
                          ? "px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full"
                          : "px-3 py-1 bg-stone-800 text-stone-500 text-[10px] font-black uppercase tracking-widest rounded-full"
                      }
                    >
                      {mode.available ? "Ativo" : "Breve"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-[900] uppercase italic tracking-tight text-white mb-3">
                    {mode.name}
                  </h3>
                  <p className="text-stone-400 text-sm font-medium leading-relaxed">
                    {mode.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
