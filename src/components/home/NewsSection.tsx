import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { MOCK_NEWS } from "@/data/mock";

export function NewsSection() {
  return (
    <section className="py-14">
      <Container>
        <WoodSign subtitle="Conteúdo de exemplo até a integração com o backend.">
          Notícias
        </WoodSign>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {MOCK_NEWS.map((item) => (
            <StonePanel key={item.id} title={item.category}>
              <article>
                <p className="text-xs font-bold uppercase text-grass-dark">{item.date}</p>
                <h3 className="mt-2 text-lg font-extrabold leading-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.excerpt}
                </p>
              </article>
            </StonePanel>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/noticias">
            <PixelButton variant="stone">Ver todas as notícias</PixelButton>
          </Link>
        </div>
      </Container>
    </section>
  );
}
