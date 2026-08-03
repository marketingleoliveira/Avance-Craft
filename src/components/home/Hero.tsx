import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { MOCK_SERVER } from "@/data/mock";
import landscape from "@/assets/voxel-landscape.jpg";
import stoneTex from "@/assets/tex-stone.jpg";
/** Placeholder original: personagem voxel com picareta. Substituir por arte final. */
import charPickaxe from "@/assets/hero-char-pickaxe.png";
/** Placeholder original: personagem voxel com espada e bloco. Substituir por arte final. */
import charSword from "@/assets/hero-char-sword.png";

const HERO_FACTS = ["Java e Bedrock", `Versão ${MOCK_SERVER.version.split(" ")[0]}`, "Servidor brasileiro"];

/** Plataforma de pedra sob os personagens. */
function StonePlatform({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div
        className="pixel-border border-stone-dark pixel-shadow-lg h-6 w-full sm:h-8"
        style={{
          backgroundImage: `url(${stoneTex})`,
          backgroundSize: "64px",
          imageRendering: "pixelated",
        }}
      />
      <div className="mx-auto h-3 w-[85%] bg-stone-dark/70" />
      <div className="mx-auto h-2 w-[65%] bg-dirt-dark/60" />
    </div>
  );
}

type CharacterProps = {
  src: string;
  alt: string;
  className?: string;
};

function Character({ src, alt, className }: CharacterProps) {
  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        width={768}
        height={1024}
        loading="lazy"
        className="mx-auto w-full drop-shadow-[0_12px_0_rgba(0,0,0,0.28)]"
        style={{ imageRendering: "pixelated" }}
      />
      <StonePlatform className="-mt-2" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-4 border-dirt-dark">
      {/* Paisagem voxel ao fundo (camadas para profundidade) */}
      <img
        src={landscape}
        alt="Paisagem original em estilo voxel com colinas, árvores em blocos e um rio"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-block/30 via-transparent to-dirt-dark/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />

      <Container className="relative py-10 sm:py-14 lg:py-20">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* Conteúdo central — primeiro no mobile */}
          <div className="order-1 text-center lg:order-2">
            <p className="font-pixel text-[9px] uppercase text-parchment text-outline sm:text-[10px]">
              Servidor brasileiro de blocos
            </p>

            <h1 className="font-pixel text-outline mt-4 text-3xl uppercase leading-[1.45] text-emerald-block sm:text-5xl lg:text-6xl">
              Habblet
              <br />
              Mine
            </h1>

            <p className="font-pixel mt-5 text-[9px] uppercase leading-[1.9] text-parchment text-outline sm:text-[11px]">
              Construa histórias.
              <br className="sm:hidden" /> Faça amigos.
              <br className="sm:hidden" /> Viva novas aventuras.
            </p>

            <p className="mx-auto mt-5 max-w-lg text-sm font-semibold text-parchment drop-shadow-[0_2px_0_rgba(0,0,0,0.7)] sm:text-base">
              Um servidor brasileiro de Survival com economia, missões, eventos e uma
              comunidade pronta para receber você.
            </p>

            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <PixelButton variant="emerald">Jogar agora</PixelButton>
              <Link to="/loja" className="contents">
                <PixelButton variant="wood">Conhecer a loja</PixelButton>
              </Link>
              <PixelButton variant="stone">Entrar no Discord</PixelButton>
            </div>

            <ul className="mt-7 flex flex-wrap justify-center gap-2">
              {HERO_FACTS.map((fact) => (
                <li
                  key={fact}
                  className="pixel-border border-dirt-dark bg-parchment/90 px-3 py-2 font-pixel text-[8px] uppercase text-dirt-dark sm:text-[9px]"
                >
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Personagens — menores e abaixo no mobile */}
          <Character
            src={charPickaxe}
            alt="Personagem original em estilo voxel segurando uma picareta"
            className="order-2 mx-auto w-40 max-w-full sm:w-52 lg:order-1 lg:w-full"
          />
          <Character
            src={charSword}
            alt="Personagem original em estilo voxel com armadura esmeralda, espada e bloco"
            className="order-3 mx-auto w-40 max-w-full sm:w-52 lg:w-full"
          />
        </div>
      </Container>
    </section>
  );
}
