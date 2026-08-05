import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";


export function CommunitySection({ settings }: { settings?: Record<string, string> }) {
  const discordUrl = settings?.["discord_url"] || "https://discord.gg/habbletmine";
  const socialLinks = [
    { label: "Instagram", href: settings?.["instagram_url"] || "#" },
    { label: "TikTok", href: settings?.["tiktok_url"] || "#" },
    { label: "YouTube", href: settings?.["youtube_url"] || "#" },
  ].filter(l => l.href !== "#");



  return (
    <section className="py-14" id="community">
      <Container>
        <WoodSign subtitle="Converse, participe de eventos e acompanhe as novidades.">
          Comunidade
        </WoodSign>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <StonePanel title="Discord oficial">
            <p className="text-sm leading-relaxed">
              Nosso Discord é o ponto de encontro do Avance: avisos, suporte, eventos,
              busca por clãs e canais de voz para jogar acompanhado.
            </p>
            <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {["Avisos e atualizações", "Suporte da equipe", "Canais de clãs", "Eventos e sorteios"].map(
                (topic) => (
                  <li key={topic} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-emerald-block"
                      aria-hidden
                    />
                    {topic}
                  </li>
                ),
              )}
            </ul>
            <a href={discordUrl} className="mt-5 block">
              <PixelButton variant="emerald" className="w-full">
                Entrar no Discord
              </PixelButton>
            </a>
          </StonePanel>

          <StonePanel title="Redes sociais">
            <ul className="grid gap-3">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a href={social.href} className="block">
                    <PixelButton variant="stone" className="w-full justify-between">
                      {social.label}
                      <span aria-hidden>→</span>
                    </PixelButton>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Links de exemplo — endereços reais serão adicionados no lançamento.
            </p>
          </StonePanel>
        </div>
      </Container>
    </section>
  );
}
