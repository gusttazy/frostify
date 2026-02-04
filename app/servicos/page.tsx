import { Suspense } from "react"
import { ServicosContent } from "@/components/servicos-content"

interface ServicosPageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function ServicosPage({ searchParams }: ServicosPageProps) {
  const params = await searchParams
  const initialFilter = params.filter as "aguardando" | "em_andamento" | "concluido" | "all" | undefined

  return (
    <Suspense fallback={null}>
      <ServicosContent initialFilter={initialFilter} />
    </Suspense>
  )
}
