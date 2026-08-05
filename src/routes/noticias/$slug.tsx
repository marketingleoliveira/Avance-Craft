import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/noticias/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/noticias/$slug"!</div>
}
