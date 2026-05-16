"use client"
import { useRouter } from "next/navigation"
import useParents from "@/hooks/useParents"
import CollectionPage from "@/components/pages/CollectionPage"

const headers = [
  { key: "name", label: "Name", sortable: false },
  { key: "email", label: "Email", sortable: false },
  { key: "phone", label: "Phone", sortable: false },
  { key: "address", label: "Address", sortable: false },
]

export default function View() {
  const { parents, loading } = useParents()
  const router = useRouter()

  const breadcrumbs = [{ label: "Parents" }]

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      title="Parents"
      description="All parents and guardians on record"
      headers={headers}
      data={parents}
      loading={loading}
      badge={parents?.length ?? 0}
      onRowClick={(item) => router.push(`/parents/${item.id}`)}
    />
  )
}
