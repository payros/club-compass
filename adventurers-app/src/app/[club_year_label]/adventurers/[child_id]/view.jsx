"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ResourcePage from "@/components/pages/ResourcePage"
import { fromDateOfBirthToAge, fromDateToString } from "@/utils/dateUtils"
import { fromSnakeCaseToTitleCase } from "@/utils/stringUtils"

export default function View() {
  const { club_year_label: clubYearLabel, child_id: childId } = useParams()
  const router = useRouter()

  const [child, setChild] = useState(null)
  const [parents, setParents] = useState([])
  const [awards, setAwards] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingParents, setLoadingParents] = useState(true)
  const [loadingAwards, setLoadingAwards] = useState(true)

  useEffect(() => {
    fetch(`/api/children/${childId}`)
      .then(r => r.json())
      .then(data => { setChild(data); setLoading(false) })
      .catch(() => setLoading(false))

    fetch(`/api/children/${childId}/parents`)
      .then(r => r.json())
      .then(data => { setParents(data); setLoadingParents(false) })
      .catch(() => setLoadingParents(false))

    fetch(`/api/children/${childId}/awards`)
      .then(r => r.json())
      .then(data => { setAwards(data); setLoadingAwards(false) })
      .catch(() => setLoadingAwards(false))
  }, [childId])

  const name = child
    ? `${child.firstName ?? child.first_name} ${child.lastName ?? child.last_name}`
    : "Adventurer"

  const breadcrumbs = [
    { label: clubYearLabel, href: `/${clubYearLabel}/dashboard` },
    { label: "Adventurers", href: `/${clubYearLabel}/adventurers` },
    { label: name },
  ]

  const fields = child ? [
    { label: "First Name", value: child.firstName ?? child.first_name },
    { label: "Last Name", value: child.lastName ?? child.last_name },
    { label: "Age", value: (child.dateOfBirth ?? child.date_of_birth) ? fromDateOfBirthToAge(child.dateOfBirth ?? child.date_of_birth) : "—" },
    { label: "Date of Birth", value: (child.dateOfBirth ?? child.date_of_birth) ? fromDateToString(child.dateOfBirth ?? child.date_of_birth) : "—" },
    { label: "Sex", value: child.sex ? fromSnakeCaseToTitleCase(child.sex) : "—" },
    { label: "Allergies", value: child.allergies ?? "None" },
    { label: "Medical Conditions", value: child.medicalConditions ?? child.medical_conditions ?? "None" },
  ] : []

  const relatedCards = [
    {
      title: "Parents / Guardians",
      badge: parents.length,
      headers: [
        { key: "name", label: "Name", sortable: false },
        { key: "phone", label: "Phone", sortable: false },
        { key: "email", label: "Email", sortable: false },
      ],
      data: parents.map(p => ({
        id: p.id,
        name: `${p.firstName ?? p.first_name} ${p.lastName ?? p.last_name}`,
        phone: p.phone ?? "—",
        email: p.email ?? "—",
      })),
      loading: loadingParents,
      onRowClick: (item) => router.push(`/parents/${item.id}`),
    },
    {
      title: "Awards",
      badge: awards.length,
      headers: [
        { key: "name", label: "Award", sortable: false },
        { key: "type", label: "Type", sortable: false },
        { key: "awardedOn", label: "Awarded On", sortable: false },
      ],
      data: awards.map(a => ({
        id: a.id,
        name: a.name ?? "—",
        type: a.type ? fromSnakeCaseToTitleCase(a.type) : "—",
        awardedOn: a.awardedOn ?? a.awarded_on ? fromDateToString(a.awardedOn ?? a.awarded_on) : "—",
      })),
      loading: loadingAwards,
    },
  ]

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      title={name}
      subtitle="Adventurer"
      loading={loading}
      fields={fields}
      relatedCards={relatedCards}
    />
  )
}
