import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { WoodSign } from '@/components/ui-kit/WoodSign'
import { StonePanel } from '@/components/ui-kit/StonePanel'
import { PixelButton } from '@/components/ui-kit/PixelButton'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitFeedback, getMyFeedbacks } from '@/lib/services/feedback.functions'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle2, MessageSquare, Plus, Clock, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

const feedbackFormSchema = z.object({
  type: z.enum(['bug', 'suggestion', 'economy', 'performance', 'bedrock', 'java', 'interface', 'shop', 'delivery', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(100),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  steps_to_reproduce: z.string().optional(),
  expected_result: z.string().optional(),
  actual_result: z.string().optional(),
  minecraft_nickname: z.string().min(3, 'Nickname inválido').or(z.literal('')),
  edition: z.enum(['java', 'bedrock']).optional(),
  version: z.string().optional(),
  contact_consent: z.boolean(),
})

type FeedbackFormData = z.infer<typeof feedbackFormSchema>

export const Route = createFileRoute('/beta/feedback')({
  component: BetaFeedbackPage,
})

function BetaFeedbackPage() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  
  const submitFn = useServerFn(submitFeedback)
  const getFeedbacksFn = useServerFn(getMyFeedbacks)

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['my-feedbacks'],
    queryFn: () => getFeedbacksFn(),
  })

  const mutation = useMutation({
    mutationFn: submitFn,
    onSuccess: () => {
      toast.success('Feedback enviado com sucesso! Obrigado por ajudar o Avance.')
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] })
    },
    onError: (error) => {
      toast.error('Erro ao enviar feedback: ' + error.message)
    }
  })

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      type: 'bug',
      severity: 'medium',
      contact_consent: false,
      minecraft_nickname: '',
    }
  })

  const onSubmit = (data: FeedbackFormData) => {
    mutation.mutate({ data })
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <WoodSign className="px-12 py-4">
            <h1 className="text-3xl font-minecraft text-white">Feedback do Beta</h1>
          </WoodSign>
          <p className="text-gray-400 max-w-xl">
            Sua participação é fundamental. Reporte bugs, sugira melhorias e ajude a moldar o futuro do Avance.
          </p>
        </div>

        <div className="flex justify-center">
          <PixelButton 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            {showForm ? 'Ver Meus Reportes' : <><Plus size={20} /> Novo Feedback</>}
          </PixelButton>
        </div>

        {showForm ? (
          <StonePanel className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <div className="space-y-4 md:col-span-2 border-b border-white/10 pb-4">
                <h3 className="text-xl font-minecraft text-white flex items-center gap-2">
                  <MessageSquare className="text-primary" /> Informações Gerais
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-minecraft text-gray-300">Tipo de Feedback</label>
                <select 
                  {...form.register('type')}
                  className="w-full bg-black/40 border-2 border-white/10 p-2 text-white font-minecraft focus:border-primary outline-none"
                >
                  <option value="bug">Bug (Erro Técnico)</option>
                  <option value="suggestion">Sugestão</option>
                  <option value="economy">Economia</option>
                  <option value="performance">Performance/Lag</option>
                  <option value="interface">Interface/UI</option>
                  <option value="shop">Loja/Checkout</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-minecraft text-gray-300">Gravidade</label>
                <select 
                  {...form.register('severity')}
                  className="w-full bg-black/40 border-2 border-white/10 p-2 text-white font-minecraft focus:border-primary outline-none"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica (Game-breaking)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-minecraft text-gray-300">Título Curto</label>
                <input 
                  {...form.register('title')}
                  placeholder="Ex: Não consigo abrir o baú da loja"
                  className="w-full bg-black/40 border-2 border-white/10 p-2 text-white font-minecraft focus:border-primary outline-none"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-minecraft text-gray-300">Descrição Detalhada</label>
                <textarea 
                  {...form.register('description')}
                  rows={4}
                  placeholder="Explique detalhadamente o que aconteceu..."
                  className="w-full bg-black/40 border-2 border-white/10 p-2 text-white font-minecraft focus:border-primary outline-none resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* Informações Técnicas (Opcional dependendo do tipo) */}
              {form.watch('type') === 'bug' && (
                <>
                  <div className="space-y-4 md:col-span-2 border-b border-white/10 pb-4 mt-4">
                    <h3 className="text-xl font-minecraft text-white flex items-center gap-2">
                      <ShieldAlert className="text-red-500" /> Detalhes Técnicos
                    </h3>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-minecraft text-gray-300">Passos para Reproduzir</label>
                    <textarea 
                      {...form.register('steps_to_reproduce')}
                      rows={3}
                      placeholder="1. Abrir inventário&#10;2. Clicar no botão X..."
                      className="w-full bg-black/40 border-2 border-white/10 p-2 text-white font-minecraft focus:border-primary outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-minecraft text-gray-300">Nickname no Minecraft</label>
                    <input 
                      {...form.register('minecraft_nickname')}
                      className="w-full bg-black/40 border-2 border-white/10 p-2 text-white font-minecraft focus:border-primary outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-minecraft text-gray-300">Versão do Jogo</label>
                    <input 
                      {...form.register('version')}
                      placeholder="Ex: 1.20.1"
                      className="w-full bg-black/40 border-2 border-white/10 p-2 text-white font-minecraft focus:border-primary outline-none"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 md:col-span-2 flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  {...form.register('contact_consent')}
                  id="consent"
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="consent" className="text-sm text-gray-400 cursor-pointer">
                  Aceito ser contatado pela equipe para fornecer mais detalhes.
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end pt-4">
                <PixelButton 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="w-full md:w-auto px-12"
                >
                  {mutation.isPending ? 'Enviando...' : 'Enviar Reporte'}
                </PixelButton>
              </div>
            </form>
          </StonePanel>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-minecraft text-white">Seus Reportes</h3>
            
            {isLoading ? (
              <div className="text-center py-12 text-gray-500 font-minecraft animate-pulse">
                Carregando histórico...
              </div>
            ) : feedbacks?.length === 0 ? (
              <StonePanel className="p-12 text-center text-gray-400">
                Você ainda não enviou nenhum reporte.
              </StonePanel>
            ) : (
              <div className="grid gap-4">
                {feedbacks?.map((f: any) => (
                  <StonePanel key={f.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-primary/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-minecraft uppercase rounded",
                          f.type === 'bug' ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"
                        )}>
                          {f.type}
                        </span>
                        <h4 className="font-minecraft text-white">{f.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 truncate max-w-md">{f.description}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                          <Clock size={12} /> {new Date(f.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {f.status === 'resolved' ? (
                            <CheckCircle2 className="text-green-500" size={16} />
                          ) : (
                            <AlertCircle className="text-yellow-500" size={16} />
                          )}
                          <span className={cn(
                            "text-xs font-minecraft uppercase",
                            f.status === 'resolved' ? "text-green-500" : "text-yellow-500"
                          )}>
                            {f.status}
                          </span>
                        </div>
                      </div>
                      <PixelButton className="px-3 py-1 text-xs">
                        Detalhes
                      </PixelButton>
                    </div>
                  </StonePanel>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
