import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Container } from "@/components/ui-kit/Container";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { toast } from "sonner";
import { Github, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail.");
      }
      const next = new URLSearchParams(window.location.search).get("next") || "/perfil";
      window.location.href = next;
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "discord" | "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/perfil`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Erro ao entrar com ${provider}`);
    }
  };

  return (
    <main className="py-20">
      <Container className="max-w-[480px]">
        <StonePanel className="p-8">
          <div className="mb-8 text-center">
            <WoodSign subtitle={mode === "login" ? "Entre na sua conta" : "Crie seu perfil"}>
              {mode === "login" ? "Login" : "Cadastro"}
            </WoodSign>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="font-pixel text-[10px] uppercase text-dirt-dark flex items-center gap-2">
                <Mail className="w-3 h-3" /> E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-parchment/50 border-2 border-dirt-dark p-3 font-sans text-sm focus:outline-none focus:border-grass"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="font-pixel text-[10px] uppercase text-dirt-dark flex items-center gap-2">
                <Lock className="w-3 h-3" /> Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-parchment/50 border-2 border-dirt-dark p-3 font-sans text-sm focus:outline-none focus:border-grass"
                placeholder="••••••••"
              />
            </div>

            <PixelButton
              variant="emerald"
              className="w-full mt-4"
              type="submit"
              disabled={loading}
            >
              {loading ? "Carregando..." : mode === "login" ? "Entrar" : "Criar Conta"}
            </PixelButton>
          </form>

          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dirt-dark/20"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-pixel bg-parchment px-2 text-muted-foreground">
                Ou entrar com
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin("discord")}
                className="pixel-border border-dirt-dark bg-indigo-600 p-3 flex justify-center items-center gap-2 hover:brightness-110 transition-all"
              >
                <img src="https://svgl.app/library/discord.svg" className="w-5 h-5 invert" alt="Discord" />
                <span className="font-pixel text-[8px] uppercase text-white">Discord</span>
              </button>
              <button
                onClick={() => handleSocialLogin("google")}
                className="pixel-border border-dirt-dark bg-white p-3 flex justify-center items-center gap-2 hover:brightness-110 transition-all"
              >
                <img src="https://svgl.app/library/google.svg" className="w-5 h-5" alt="Google" />
                <span className="font-pixel text-[8px] uppercase text-dirt-dark">Google</span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <>
                Não tem uma conta?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-grass-dark font-bold hover:underline"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-grass-dark font-bold hover:underline"
                >
                  Faça login
                </button>
              </>
            )}
          </p>
        </StonePanel>
      </Container>
    </main>
  );
}
