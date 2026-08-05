import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { PixelButton } from "@/components/ui-kit/PixelButton";

import landscape from "@/assets/voxel-landscape.jpg";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-y-4 border-dirt-dark">
      <img
        src={landscape}
        alt=""
        aria-hidden
        width={1920}
        height={1080}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-dirt-dark/80" />

      <Container className="relative py-14 text-center">
        <h2 className="font-pixel text-outline text-xl uppercase leading-[1.5] text-emerald-block sm:text-3xl">
          Sua aventura começa aqui
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm font-semibold text-parchment sm:text-base">
          Guarde o endereço, chame seus amigos e prepare a picareta para o lançamento do
          Avance.
        </p>
        <p className="font-pixel mt-5 text-[9px] uppercase text-parchment text-outline sm:text-[11px]">
          jogar.habbletmine.com.br
        </p>
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <PixelButton variant="emerald">Jogar agora</PixelButton>
          <Link to="/loja" className="contents">
            <PixelButton variant="wood">Conhecer a loja</PixelButton>
          </Link>
        </div>
      </Container>
    </section>
  );
}
