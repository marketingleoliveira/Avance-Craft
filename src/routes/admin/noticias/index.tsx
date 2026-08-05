import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/noticias/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/noticias/"!</div>
}
