import { Container } from "@/components/ui-kit/Container";
import { MessageSquare, Instagram, Youtube, Share2, Users, Bell, LifeBuoy, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function CommunitySection({ settings }: { settings?: Record<string, string> }) {
  const discordUrl = settings?.["discord_url"] || "https://discord.gg/avance";
  const socialLinks = [
    { label: "Instagram", href: settings?.["instagram_url"] || "#", icon: Instagram, color: "hover:text-pink-500" },
    { label: "TikTok", href: settings?.["tiktok_url"] || "#", icon: Share2, color: "hover:text-cyan-400" },
    { label: "YouTube", href: settings?.["youtube_url"] || "#", icon: Youtube, color: "hover:text-red-500" },
  ].filter(l => l.href !== "#");

  const FEATURES = [
    { label: "Avisos e atualizações", icon: Bell },
    { label: "Suporte da equipe", icon: LifeBuoy },
    { label: "Canais de clãs", icon: Sword },
    { label: "Eventos e sorteios", icon: Users },
  ];

  return (
    <section className="relative overflow-hidden" id="community">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <MessageSquare className="w-3 h-3" />
                Vida Social
              </div>
              <h2 className="text-4xl md:text-6xl font-[900] tracking-[-0.03em] uppercase italic text-white">
                Nossa <span className="text-emerald-500">Comunidade</span>
              </h2>
              <p className="text-stone-400 font-medium text-lg max-w-xl leading-relaxed">
                O Avance é mais que um servidor, é um ponto de encontro. Participe de eventos exclusivos, 
                tire dúvidas com a equipe e encontre novos aliados no nosso Discord oficial.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {FEATURES.map((item) => (
                <Card key={item.label} className="flex items-center gap-4 p-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-stone-950 transition-all">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-tight text-stone-200">{item.label}</span>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[200px]">
                <Button className="w-full h-16 rounded-2xl text-base shadow-2xl shadow-emerald-500/20">
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Entrar no Discord
                </Button>
              </a>
            </div>
          </div>

          {/* Right Content - Social Grid */}
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all" />
            <div className="relative grid gap-4">
              <Card className="p-10 !rounded-[2.5rem]">
                <h3 className="text-xl font-[900] uppercase italic tracking-wider text-white mb-8 border-b border-white/5 pb-4 flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-emerald-500" />
                  Siga o Avance
                </h3>
                <div className="grid gap-4">
                  {socialLinks.map((social) => (
                    <a 
                      key={social.label} 
                      href={social.href} 
                      className={cn(
                        "flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.08] hover:translate-x-2 group/social",
                        social.color
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <social.icon className="w-6 h-6 transition-transform group-hover/social:scale-110" />
                        <span className="font-black uppercase tracking-widest text-sm">{social.label}</span>
                      </div>
                      <span className="text-stone-600 font-bold">→</span>
                    </a>
                  ))}
                </div>
                <p className="mt-8 text-xs font-medium text-stone-500 text-center uppercase tracking-widest italic opacity-50">
                  Novos conteúdos diariamente
                </p>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
