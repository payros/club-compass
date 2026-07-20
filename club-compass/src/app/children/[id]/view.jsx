'use client'
import { useParams, useRouter } from 'next/navigation'
import ResourcePage from '@/components/pages/ResourcePage'
import { fromDateOfBirthToAge, fromDateToString } from '@/utils/dateUtils'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

export default function View({ child }) {
  const { id } = useParams()
  const router = useRouter()
  const loading = false

  const name = child ? `${child.firstName} ${child.lastName}` : 'Child'

  const breadcrumbs = [{ label: 'Children', href: '/children' }, { label: name }]

  const actions = [
    {
      label: 'Edit Child',
      href: `/children/${id}/edit`,
    },
    {
      label: 'Edit Awards',
      href: `/children/${id}/edit-awards`,
    },
  ]

  const fields = child
    ? [
        { label: 'First Name', value: child.firstName },
        { label: 'Last Name', value: child.lastName },
        {
          label: 'Age',
          value: child.dateOfBirth ? fromDateOfBirthToAge(child.dateOfBirth) : '—',
        },
        {
          label: 'Date of Birth',
          value: child.dateOfBirth ? fromDateToString(child.dateOfBirth) : '—',
        },
        { label: 'Sex', value: child.sex ? fromSnakeCaseToTitleCase(child.sex) : '—' },
        { label: 'Allergies', value: child.allergies ?? 'None' },
        { label: 'Medical Conditions', value: child.medicalConditions ?? 'None' },
      ]
    : []

  const relatedCards = [
    {
      title: 'Parents / Guardians',
      headers: [
        { key: 'name', label: 'Name', sortable: false },
        { key: 'phone', label: 'Phone', sortable: false },
        { key: 'email', label: 'Email', sortable: false },
      ],
      data: (child?.parents ?? []).map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        phone: p.phone ?? '—',
        email: p.email ?? '—',
      })),
      loading,
      onRowClick: (item) => router.push(`/parents/${item.id}`),
    },
    {
      title: 'Awards',
      headers: [
        { key: 'name', label: 'Award', sortable: false },
        { key: 'type', label: 'Type', sortable: false },
        { key: 'awardedOn', label: 'Awarded On', sortable: false },
      ],
      data: (child?.awards ?? []).map((a) => ({
        id: a.id,
        name: a.name ?? '—',
        type: a.type ? fromSnakeCaseToTitleCase(a.type) : '—',
        awardedOn: a.awardedOn ? fromDateToString(a.awardedOn) : '—',
      })),
      loading,
    },
  ]

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      title={name}
      subtitle="Child"
      loading={loading}
      fields={fields}
      relatedCards={relatedCards}
      actions={actions}
      imageUrl={child?.profileImageUrl ?? '/img/profile_placeholder.png'}
      imagePadding={15}
    />
  )
}
