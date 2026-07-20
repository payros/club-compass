'use client'
import { useParams, useRouter } from 'next/navigation'
import ResourcePage from '@/components/pages/ResourcePage'
import { fromDateOfBirthToAge, fromDateToString } from '@/utils/dateUtils'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

export default function View({ child, clubYear }) {
  const { club_year_label: clubYearLabel, child_id: childId } = useParams()
  const router = useRouter()
  const loading = false

  const name = child ? `${child.firstName} ${child.lastName}` : 'Adventurer'

  const breadcrumbs = [{ label: 'Adventurers', href: `/${clubYearLabel}/adventurers` }, { label: name }]

  const actions = [
    {
      label: 'Edit Adventurer',
      href: `/${clubYearLabel}/adventurers/${childId}/edit`,
    },
  ]

  const fields = child
    ? [
        { label: 'Age', value: child.dateOfBirth ? fromDateOfBirthToAge(child.dateOfBirth, clubYear?.endDate) : '—' },
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
      description: `Earned ${clubYearLabel ? 'in ' + clubYearLabel : 'this club year'}`,
      headers: [
        { key: 'patchImageUrl', label: '', type: 'image', sortable: false },
        { key: 'name', label: 'Award', sortable: false },
        { key: 'type', label: 'Type', sortable: false },
        { key: 'eventTitle', label: 'Earned On', sortable: false, hrefKey: 'eventHref' },
        { key: 'awardedOn', label: 'Awarded On', sortable: false },
      ],
      width: 'medium',
      data: (child?.awards ?? []).map((a) => ({
        id: a.id,
        patchImageUrl: a.patchImageUrl ?? null,
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
      imageUrl={child?.profileImageUrl ?? '/img/profile_placeholder.png'}
      imagePadding={15}
    />
  )
}
