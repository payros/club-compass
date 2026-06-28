"use client"
import useUsers from "@/hooks/useUsers"
import CollectionPage from "@/components/pages/CollectionPage"

const headers = [
  { key: "name", label: "Name", sortable: false },
  { key: "email", label: "Email", sortable: false },
  { key: "createdAt", label: "Created", sortable: false },
]

export default function View() {
  const { users, loading } = useUsers()

  const breadcrumbs = [{ label: "Users" }]

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      title="Users"
      description="App user accounts"
      headers={headers}
      data={users}
      loading={loading}
      badge={users?.length ?? 0}
    />
  )
}
