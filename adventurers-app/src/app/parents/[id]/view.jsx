"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ResourcePage from "@/components/pages/ResourcePage"
import { fromDateOfBirthToAge, fromDateToString } from "@/utils/dateUtils"

export default function View() {
  const { id } = useParams()
  const router = useRouter()
  const [parent, setParent] = useState(null)
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingChildren, setLoadingChildren] = useState(true)

  useEffect(() => {
    fetch(`/api/parents/${id}`)
      .then(r => r.json())
      .then(data => { setParent(data); setLoading(false) })
      .catch(() => setLoading(false))

    fetch(`/api/parents/${id}/children`)
      .then(r => r.json())
      .then(data => { setChildren(data); setLoadingChildren(false) })
      .catch(() => setLoadingChildren(false))
  }, [id])

  const name = parent
    ? `${parent.firstName ?? parent.first_name} ${parent.lastName ?? parent.last_name}`
    : "Parent"

  const breadcrumbs = [
    { label: "Parents", href: "/parents" },
    { label: name },
  ]

  const fields = parent ? [
    { label: "First Name", value: parent.firstName ?? parent.first_name },
    { label: "Last Name", value: parent.lastName ?? parent.last_name },
    { label: "Email", value: parent.email ?? "—" },
    { label: "Phone", value: parent.phone ?? "—" },
    { label: "Address", value: parent.address ?? "—" },
  ] : []

  const relatedCards = [
    {
      title: "Children",
      badge: children.length,
      headers: [
        { key: "name", label: "Name", sortable: false },
        { key: "age", label: "Age", sortable: false },
        { key: "sex", label: "Sex", sortable: false },
      ],
      data: children.map(c => ({
        id: c.id,
        name: `${c.firstName ?? c.first_name} ${c.lastName ?? c.last_name}`,
        age: (c.dateOfBirth ?? c.date_of_birth) ? fromDateOfBirthToAge(c.dateOfBirth ?? c.date_of_birth) : "—",
        sex: c.sex ?? "—",
      })),
      loading: loadingChildren,
      onRowClick: (item) => router.push(`/children/${item.id}`),
    },
  ]

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      title={name}
      subtitle="Parent / Guardian"
      loading={loading}
      fields={fields}
      relatedCards={relatedCards}
    />
  )
}
