import { Container } from "@/components/ui-kit/Container";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { MOCK_SERVER } from "@/data/mock";
import landscape from "@/assets/voxel-landscape.jpg";
import heroesLeft from "@/assets/voxel-heroes-left.png";
import heroesRight from "@/assets/voxel-heroes-right.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-4 border-dirt-dark">
      <img
        src={landscape}
        alt="Paisagem em estilo voxel com colinas, árvores em blocos e um rio"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-block/20 via-transparent to-dirt-dark/70" />

      <Container className="relative py-14 sm:py-20">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <img
            src={heroesLeft}
            alt="Personagens em estilo voxel: explorador com picareta e minerador com tocha"
            width={768}
            height={1024}
            loading="lazy"
            className="hidden w-40 justify-self-end drop-shadow-[0_10px_0_rgba(0,0,0,0.25)] lg:block xl:w-52"
          />

          <div className="text-center">
            <p className="font-pixel text-[10px] uppercase text-parchment text-outline">
              Servidor brasileiro de blocos
            </p>
            <h1 className="font-pixel text-outline mt-4 text-2xl uppercase leading-[1.5] text-emerald-block sm:text-4xl lg:text-5xl">
              Habblet
              <br />
              Mine
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm font-semibold text-parchment drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] sm:text-base">
              Construa, explore e faça parte de uma comunidade nostálgica. Um portal clássico
              de servidor, repaginado para 2026.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <PixelButton variant="emerald">Como jogar</PixelButton>
              <PixelButton variant="wood">Copiar IP</PixelButton>
            </div>

            <p className="font-pixel mt-6 text-[9px] uppercase text-parchment text-outline">
              {MOCK_SERVER.ip}
            </p>
          </div>

          <img
            src={heroesRight}
            alt="Personagens em estilo voxel: cavaleiro de armadura esmeralda e criatura amigável"
            width={768}
            height={1024}
            loading="lazy"
            className="hidden w-40 drop-shadow-[0_10px_0_rgba(0,0,0,0.25)] lg:block xl:w-52"
          />
        </div>
      </Container>
    </section>
  );
}
