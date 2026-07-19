'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useChildren from '@/hooks/useChildren'
import useStaff from '@/hooks/useStaff'
import useEvents from '@/hooks/useEvents'
import ResourcePage from '@/components/pages/ResourcePage'
import { fromDateToString } from '@/utils/dateUtils'

export default function View({ clubYear: serverClubYear }) {
  const { club_year_label: label } = useParams()
  const router = useRouter()

  const [clubYear, setClubYear] = useState(serverClubYear ?? null)
  const [loading, setLoading] = useState(!serverClubYear)

  useEffect(() => {
    if (serverClubYear) return
    if (!label) return
    setLoading(true)
    fetch(`/api/club-years/${label}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setClubYear(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [label])

  const { children, loading: loadingChildren } = useChildren(label)
  const { staff, loading: loadingStaff } = useStaff(label)
  const { events, loadingEvents } = useEvents(label, {})

  const title = clubYear?.label ?? label

  const breadcrumbs = [{ label: 'Club Years', href: '/club-years' }, { label: title }]

  const actions = [
    { label: 'Edit Club Year', href: `/club-years/${label}/edit` },
    { label: 'Go to Dashboard', href: `/${label}/dashboard` },
  ]

  const fields = clubYear
    ? [
        { label: 'Club Name', value: clubYear.clubName ?? '—' },
        { label: 'Church Name', value: clubYear.churchName ?? '—' },
        {
          label: 'Start Date',
          value: clubYear.startDate ? fromDateToString(clubYear.startDate) : '—',
        },
        {
          label: 'End Date',
          value: clubYear.endDate ? fromDateToString(clubYear.endDate) : '—',
        },
        {
          label: 'Enrolled Adventurers',
          value: clubYear.enrolledAdventurers ?? 0,
        },
      ]
    : []

  const relatedCards = [
    {
      title: 'Adventurers',
      href: `/${label}/adventurers`,
      headers: [
        { key: 'name', label: 'Name', sortable: false },
        { key: 'class', label: 'Class', sortable: false },
        { key: 'age', label: 'Age', sortable: false },
      ],
      data: children,
      loading: loadingChildren,
      onRowClick: (item) => router.push(`/children/${item.id}`),
    },
    {
      title: 'Staff',
      href: `/${label}/staff`,
      headers: [
        { key: 'name', label: 'Name', sortable: false },
        { key: 'role', label: 'Role', sortable: false },
      ],
      data: staff,
      loading: loadingStaff,
      onRowClick: (item) => router.push(`/staff/${item.id}`),
    },
    {
      title: 'Events',
      href: `/${label}/events`,
      headers: [
        { key: 'title', label: 'Title', sortable: false },
        { key: 'eventDate', label: 'Date', sortable: false },
      ],
      data: events,
      loading: loadingEvents,
      onRowClick: (item) => router.push(`/${label}/events/${item.id}`),
    },
  ]

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      title={title}
      loading={loading}
      fields={fields}
      relatedCards={relatedCards}
      actions={actions}
    />
  )
}
