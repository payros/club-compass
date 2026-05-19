"use client"
import useAwards from "@/hooks/useAwards"
import CollectionPage from "@/components/pages/CollectionPage"

const headers = [
  { key: "name", label: "Name", sortable: false },
  { key: "type", label: "Type", sortable: false },
  { key: "level", label: "Level", sortable: false },
]

export default function View() {
  const { awards, loading } = useAwards()

  const breadcrumbs = [{ label: "Awards" }]

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      title="Awards"
      description="All available awards"
      headers={headers}
      data={awards}
      loading={loading}
      badge={awards?.length ?? 0}
    />
  )
}
