import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { MOCK_STEPS } from "@/data/mock";

export function HowToPlay() {
  return (
    <section className="border-y-4 border-dirt-dark bg-stone/20 py-14">
      <Container>
        <WoodSign subtitle="Três passos para entrar no servidor.">Como jogar</WoodSign>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {MOCK_STEPS.map((step) => (
            <li key={step.step}>
              <StonePanel>
                <span className="font-pixel pixel-border border-dirt-dark bg-wood grid h-11 w-11 place-items-center text-[10px] text-dirt-dark">
                  {step.step}
                </span>
                <h3 className="mt-4 text-lg font-extrabold leading-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </StonePanel>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex justify-center">
          <Link to="/como-jogar">
            <PixelButton variant="emerald">Guia completo</PixelButton>
          </Link>
        </div>
      </Container>
    </section>
  );
}
