'use client'
import { useParams, useRouter } from 'next/navigation'
import ResourcePage from '@/components/pages/ResourcePage'
import { fromDateOfBirthToAge, fromDateToString } from '@/utils/dateUtils'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import useChild from '@/hooks/useChild'

export default function View() {
  const { club_year_label: clubYearLabel, child_id: childId } = useParams()
  const router = useRouter()
  const { child, loading } = useChild(childId, clubYearLabel)

  const name = child ? `${child.firstName} ${child.lastName}` : 'Adventurer'

  const breadcrumbs = [{ label: 'Adventurers', href: `/${clubYearLabel}/adventurers` }, { label: name }]

  const actions = [
    {
      label: 'Edit Awards',
      href: `/children/${childId}/edit-awards`,
    },
  ]

  const fields = child
    ? [
        { label: 'First Name', value: child.firstName },
        { label: 'Last Name', value: child.lastName },
        { label: 'Age', value: child.dateOfBirth ? fromDateOfBirthToAge(child.dateOfBirth) : '—' },
        { label: 'Date of Birth', value: child.dateOfBirth ? fromDateToString(child.dateOfBirth) : '—' },
        { label: 'Sex', value: child.sex ? fromSnakeCaseToTitleCase(child.sex) : '—' },
        { label: 'Allergies', value: child.allergies ?? 'None' },
        { label: 'Medical Conditions', value: child.medicalConditions ?? 'None' },
        ...(child.class ? [{ label: 'Class', value: fromSnakeCaseToTitleCase(child.class.class) }] : []),
      ]
    : []

  const relatedCards = [
    {
      title: 'Parents / Guardians',
      badge: child?.parents?.length ?? 0,
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
      badge: child?.awards?.length ?? 0,
      headers: [
        { key: 'name', label: 'Award', sortable: false },
        { key: 'type', label: 'Type', sortable: false },
        { key: 'eventTitle', label: 'Earned On', sortable: false, hrefKey: 'eventHref' },
        { key: 'awardedOn', label: 'Awarded On', sortable: false },
      ],
      data: (child?.awards ?? []).map((a) => ({
        id: a.id,
        name: a.name ?? '—',
        type: a.type ? fromSnakeCaseToTitleCase(a.type) : '—',
        awardedOn: a.awardedOn ? fromDateToString(a.awardedOn) : '—',
        eventTitle: a.event ? a.event.title : '—',
        eventHref: a.event ? `/${clubYearLabel}/events/${a.event.id}` : null,
      })),
      loading,
    },
  ]

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      title={name}
      loading={loading}
      fields={fields}
      relatedCards={relatedCards}
      actions={actions}
    />
  )
}
