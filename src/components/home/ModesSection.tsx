import { Container } from "@/components/ui-kit/Container";
import { Card } from "@/components/ui/card";
import { Gamepad2, Layout, Boxes, Trophy } from "lucide-react";

export function ModesSection({ modes }: { modes: any[] }) {
  const ICONS: Record<string, any> = {
    "Survival": Boxes,
    "Creative": Layout,
    "Minigames": Gamepad2,
    "Rankup": Trophy,
  };

  return (
    <section className="relative py-24 bg-stone-950 overflow-hidden" id="modes">
      <Container>
        <div className="space-y-4 mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-[900] tracking-[-0.03em] uppercase italic text-white">
            Nossos <span className="text-emerald-500">Mundos</span>
          </h2>
          <p className="text-stone-400 font-medium text-lg max-w-xl mx-auto">
            Escolha sua aventura. Cada modo foi projetado para oferecer uma experiência única e desafiadora.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modes.map((mode: any) => {
            const Icon = ICONS[mode.name] || Boxes;
            return (
              <div key={mode.id} className="group bg-white/[0.02] border border-white/5 p-8 rounded-3xl transition-all hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-1">
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
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
