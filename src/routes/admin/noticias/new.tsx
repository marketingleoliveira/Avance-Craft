import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { adminCreateNews, adminListNewsCategories } from "@/lib/services/admin-content.functions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { ChevronLeft, Save, Loader2, Eye, Layout } from "lucide-react";

const newsSchema = z.object({
  title: z.string().trim().min(5, "O título deve ter pelo menos 5 caracteres.").max(120),
  slug: z
    .string()
    .trim()
    .min(5, "O slug deve ter pelo menos 5 caracteres.")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen."),
  summary: z.string().trim().max(300).nullable().optional(),
  content: z.string().trim().min(10, "O conteúdo deve ter pelo menos 10 caracteres."),
  imageUrl: z.string().url("URL de imagem inválida").or(z.literal("")).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'archived']),
  publishedAt: z.string().nullable().optional(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  featured: z.boolean(),
  position: z.coerce.number().int(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export const Route = createFileRoute("/admin/noticias/new")({
  component: NewNewsPage,
});

function NewNewsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories } = useSuspenseQuery({
    queryKey: ["admin-news-categories"],
    queryFn: () => adminListNewsCategories(),
  });

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      content: "",
      imageUrl: "",
      categoryId: undefined,
      status: "draft",
      publishedAt: "",
      seoTitle: "",
      seoDescription: "",
      featured: false,
      position: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: NewsFormValues) => adminCreateNews({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Notícia criada com sucesso!");
      navigate({ to: "/admin/noticias" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar notícia.");
    }
  });

  const onSubmit = (values: NewsFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="grid gap-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="pixel-border h-10 w-10 shrink-0"
          onClick={() => navigate({ to: "/admin/noticias" })}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-pixel text-xl uppercase text-foreground">Nova Notícia</h2>
          <p className="text-sm text-muted-foreground">Publique uma nova atualização ou aviso para os jogadores.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <StonePanel title="Conteúdo Principal">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-pixel text-[9px] uppercase">Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Novo Servidor Rankup!" className="pixel-border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2 mt-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-pixel text-[9px] uppercase">Slug (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="novo-servidor-rankup" className="pixel-border" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-pixel text-[9px] uppercase">Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger className="pixel-border">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="font-pixel text-[10px] uppercase">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="font-pixel text-[9px] uppercase">Resumo / Subtítulo</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve descrição que aparece na listagem..." 
                          className="pixel-border min-h-[80px]" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="font-pixel text-[9px] uppercase">Conteúdo (Markdown)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Escreva a notícia completa aqui..." 
                          className="pixel-border min-h-[300px] font-mono" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </StonePanel>

              <StonePanel title="SEO e Metadados">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-pixel text-[9px] uppercase">Título SEO</FormLabel>
                      <FormControl>
                        <Input placeholder="Título para buscadores..." className="pixel-border" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Se vazio, usa o título principal.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="font-pixel text-[9px] uppercase">Descrição SEO</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição para buscadores (Google)..." 
                          className="pixel-border min-h-[60px]" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </StonePanel>
            </div>

            <div className="space-y-6">
              <StonePanel title="Publicação">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-pixel text-[9px] uppercase">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="pixel-border">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="font-pixel text-[10px] uppercase">
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="font-pixel text-[9px] uppercase">Data de Publicação</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" className="pixel-border" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Deixe em branco para publicar agora.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border-2 border-stone-dark/10 p-3 mt-6">
                      <div className="space-y-0.5">
                        <FormLabel className="font-pixel text-[9px] uppercase">Destaque</FormLabel>
                        <FormDescription className="text-[10px]">Topo da home.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </StonePanel>

              <StonePanel title="Mídia">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-pixel text-[9px] uppercase">URL da Imagem</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." className="pixel-border" {...field} value={field.value || ""} />
                      </FormControl>
                      {field.value && (
                        <div className="mt-4 aspect-video bg-stone-dark/5 rounded overflow-hidden pixel-border">
                          <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </StonePanel>

              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full font-pixel text-[9px] uppercase bg-emerald-block hover:bg-emerald-block/90 pixel-border border-grass-dark py-6"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar Notícia
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full font-pixel text-[9px] uppercase pixel-border py-6"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
