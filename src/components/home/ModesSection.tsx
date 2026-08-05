import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { useSuspenseQuery } from "@tanstack/react-query";


export function ModesSection({ modes }: { modes: any[] }) {


  return (
    <section className="border-y-4 border-dirt-dark bg-stone/20 py-14" id="modes">
      <Container>
        <WoodSign subtitle="Modalidades disponíveis no servidor.">Modalidades</WoodSign>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modes.map((mode: any) => (
            <StonePanel key={mode.id}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-pixel text-[11px] uppercase text-grass-dark">
                  {mode.name}
                </h3>
                <span
                  className={
                    mode.available
                      ? "font-pixel pixel-border border-grass-dark bg-emerald-block px-2 py-1 text-[7px] uppercase text-accent-foreground"
                      : "font-pixel pixel-border border-wood-dark bg-wood px-2 py-1 text-[7px] uppercase text-secondary-foreground"
                  }
                >
                  {mode.available ? "Ativo" : "Em breve"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {mode.description}
              </p>
            </StonePanel>
          ))}
        </div>
      </Container>
    </section>
  );
}
