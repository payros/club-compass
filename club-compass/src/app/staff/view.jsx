"use client"
import { useRouter } from "next/navigation"
import useStaff from "@/hooks/useStaff"
import CollectionPage from "@/components/pages/CollectionPage"

const headers = [
  { key: "name", label: "Name", sortable: false },
  { key: "email", label: "Email", sortable: false },
  { key: "phone", label: "Phone", sortable: false },
  { key: "backgroundCheckExpiration", label: "BG Check Exp.", sortable: false },
]

export default function View() {
  const { staff, loading } = useStaff()
  const router = useRouter()

  const breadcrumbs = [
    { label: "Staff Directory" },
  ]

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      title="Staff Directory"
      description="All staff members on record"
      headers={headers}
      data={staff}
      loading={loading}
      badge={staff?.length ?? 0}
      onRowClick={(item) => router.push(`/staff/${item.id}`)}
    />
  )
}
