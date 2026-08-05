import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { 
  adminCreateCategory, 
  adminUpdateCategory,
  adminListCategories
} from "@/lib/services/admin.functions";
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
import { toast } from "sonner";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { useEffect } from "react";

const categorySchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres.").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "O slug deve ter pelo menos 2 caracteres.")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen."),
  description: z.string().trim().max(500).nullable().optional(),
  icon: z.string().trim().nullable().optional(),
  active: z.boolean(),
  position: z.coerce.number().int(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const Route = createFileRoute("/admin/categorias/$categoryId/edit")({
  component: EditCategoryPage,
});

function EditCategoryPage() {
  const { categoryId } = useParams({ from: "/admin/categorias/$categoryId/edit" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories } = useSuspenseQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminListCategories(),
  });

  const category = categories.find(c => c.id === categoryId);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      icon: category?.icon || "",
      active: category?.active ?? true,
      position: category?.position ?? 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CategoryFormValues) => 
      adminUpdateCategory({ data: { ...values, id: categoryId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria atualizada com sucesso!");
      navigate({ to: "/admin/categorias" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar categoria.");
    }
  });

  const onSubmit = (values: CategoryFormValues) => {
    mutation.mutate(values);
  };

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-pixel text-[10px] uppercase text-muted-foreground">Categoria não encontrada.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate({ to: "/admin/categorias" })}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="pixel-border h-10 w-10 shrink-0"
          onClick={() => navigate({ to: "/admin/categorias" })}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-pixel text-xl uppercase text-foreground">Editar Categoria</h2>
          <p className="text-sm text-muted-foreground">{category.name}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <StonePanel title="Informações Básicas">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-pixel text-[9px] uppercase">Nome da Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ranks VIP" className="pixel-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-pixel text-[9px] uppercase">Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex-ranks-vip" className="pixel-border" {...field} />
                    </FormControl>
                    <FormDescription>Usado na URL da loja.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-pixel text-[9px] uppercase">Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o que esta categoria contém..." 
                      className="pixel-border min-h-[100px]" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </StonePanel>

          <StonePanel title="Configurações e Visual">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-pixel text-[9px] uppercase">URL do Ícone/Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." className="pixel-border" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Link direto para a imagem da categoria.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-pixel text-[9px] uppercase">Ordem de Exibição</FormLabel>
                    <FormControl>
                      <Input type="number" className="pixel-border" {...field} />
                    </FormControl>
                    <FormDescription>Menores números aparecem primeiro.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border-2 border-stone-dark/10 p-4 mt-6">
                  <div className="space-y-0.5">
                    <FormLabel className="font-pixel text-[9px] uppercase">Categoria Ativa</FormLabel>
                    <FormDescription>
                      Categorias inativas não aparecem na loja pública.
                    </FormDescription>
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

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              className="font-pixel text-[9px] uppercase"
              onClick={() => navigate({ to: "/admin/categorias" })}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="font-pixel text-[9px] uppercase bg-emerald-block hover:bg-emerald-block/90 pixel-border border-grass-dark"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}