"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import ResourcePage from "@/components/pages/ResourcePage"
import { fromSnakeCaseToTitleCase } from "@/utils/stringUtils"
import { fromDateToString } from "@/utils/dateUtils"

export default function View() {
  const { id } = useParams()
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/staff/${id}`)
      .then(r => r.json())
      .then(data => { setStaff(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const name = staff
    ? `${staff.firstName ?? staff.first_name} ${staff.lastName ?? staff.last_name}`
    : "Staff Member"

  const breadcrumbs = [
    { label: "Staff Directory", href: "/staff" },
    { label: name },
  ]

  const fields = staff ? [
    { label: "First Name", value: staff.firstName ?? staff.first_name },
    { label: "Last Name", value: staff.lastName ?? staff.last_name },
    { label: "Email", value: staff.email ?? "—" },
    { label: "Phone", value: staff.phone ?? "—" },
    { label: "Background Check Expiry", value: (staff.backgroundCheckExpiration ?? staff.background_check_expiration) ? fromDateToString(staff.backgroundCheckExpiration ?? staff.background_check_expiration) : "—" },
  ] : []

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      title={name}
      subtitle="Staff Member"
      loading={loading}
      fields={fields}
    />
  )
}
