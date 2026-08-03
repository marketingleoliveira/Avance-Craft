import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { MOCK_RANKING, MOCK_STEPS } from "@/data/mock";

export function RankingAndSteps() {
  return (
    <section className="py-14">
      <Container>
        <WoodSign subtitle="Posições e números são apenas exemplos visuais.">
          Comunidade
        </WoodSign>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <StonePanel title="Ranking de jogadores">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-dirt-dark/30 text-xs uppercase text-muted-foreground">
                  <th className="py-2">#</th>
                  <th className="py-2">Jogador</th>
                  <th className="py-2">Clã</th>
                  <th className="py-2 text-right">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RANKING.map((row) => (
                  <tr key={row.position} className="border-b border-dirt-dark/15">
                    <td className="py-2 font-black text-grass-dark">{row.position}</td>
                    <td className="py-2 font-semibold">{row.player}</td>
                    <td className="py-2 text-muted-foreground">{row.clan}</td>
                    <td className="py-2 text-right font-semibold">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/ranking" className="mt-5 block">
              <PixelButton variant="stone" className="w-full">
                Ranking completo
              </PixelButton>
            </Link>
          </StonePanel>

          <StonePanel title="Como jogar">
            <ol className="grid gap-5">
              {MOCK_STEPS.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span className="font-pixel pixel-border border-dirt-dark bg-wood grid h-10 w-10 shrink-0 place-items-center text-[10px] text-dirt-dark">
                    {step.step}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-extrabold">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/como-jogar" className="mt-5 block">
              <PixelButton variant="emerald" className="w-full">
                Guia completo
              </PixelButton>
            </Link>
          </StonePanel>
        </div>
      </Container>
    </section>
  );
}
