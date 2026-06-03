'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import useChildren from '@/hooks/useChildren'
import useEvents from '@/hooks/useEvents'
import useStaff from '@/hooks/useStaff'
import useClasses from '@/hooks/useClasses'
import useAwards from '@/hooks/useAwards'
import DashboardPage from '@/components/pages/DashboardPage'

const View = () => {
  const clubYearLabel = useParams()['club_year_label']
  const router = useRouter()

  const [sortBy, setSortBy] = useState({
    children: { by: null, direction: 'asc' },
    events: { by: null, direction: 'asc' },
  })

  const { children, loading: loadingChildren } = useChildren(clubYearLabel, sortBy.children)
  const { events, loadingEvents } = useEvents(clubYearLabel, sortBy.events)
  const { staff, loading: loadingStaff } = useStaff(clubYearLabel)
  const { classes, loading: loadingClasses } = useClasses(clubYearLabel)
  const { awards, loading: loadingAwards } = useAwards(clubYearLabel)

  function handleSorting(by, tableKey) {
    setSortBy((prev) => {
      const newDirection = prev[tableKey]?.by === by && prev[tableKey]?.direction === 'asc' ? 'desc' : 'asc'
      return { ...prev, [tableKey]: { by, direction: newDirection } }
    })
  }

  const breadcrumbs = [{ label: clubYearLabel, href: `/${clubYearLabel}/dashboard` }, { label: 'Dashboard' }]

  const actions = [
    {
      label: 'Enroll Staff',
      href: `/${clubYearLabel}/staff/enroll`,
    },
    {
      label: 'Update Classes',
      href: `/${clubYearLabel}/classes/new`,
    },
    {
      label: 'Enroll Family',
      href: `/${clubYearLabel}/families/enroll`,
    },
    {
      label: 'Add Event',
      href: `/${clubYearLabel}/events/new`,
    },
    {
      label: 'View Directories',
      href: `/directories`,
    },
  ]

  const cards = [
    {
      title: 'Adventurers',
      description: `${children.length} registered for ${clubYearLabel}`,
      href: `/${clubYearLabel}/adventurers`,
      headers: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'age', label: 'Age', sortable: true },
        { key: 'class', label: 'Class', sortable: true },
      ],
      data: children,
      loading: loadingChildren,
      sortBy: sortBy.children.by,
      sortDirection: sortBy.children.direction,
      handleSort: (by) => handleSorting(by, 'children'),
      onRowClick: (item) => router.push(`/${clubYearLabel}/adventurers/${item.id}`),
    },
    {
      title: 'Events',
      description: `${events.length} scheduled for ${clubYearLabel}`,
      href: `/${clubYearLabel}/events`,
      headers: [
        { key: 'title', label: 'Title', sortable: true },
        { key: 'eventDate', label: 'Date', sortable: true },
      ],
      data: events,
      loading: loadingEvents,
      sortBy: sortBy.events.by,
      sortDirection: sortBy.events.direction,
      handleSort: (by) => handleSorting(by, 'events'),
      onRowClick: (item) => router.push(`/${clubYearLabel}/events/${item.id}`),
    },
    {
      title: 'Staff',
      description: `${staff.length} helping in ${clubYearLabel}`,
      href: `/${clubYearLabel}/staff`,
      headers: [
        { key: 'name', label: 'Name', sortable: false },
        { key: 'role', label: 'Role', sortable: false },
      ],
      data: staff,
      loading: loadingStaff,
      onRowClick: (item) => router.push(`/${clubYearLabel}/staff/${item.id}`),
    },
    {
      title: 'Classes',
      description: `Classes instructors in ${clubYearLabel}`,
      href: `/${clubYearLabel}/classes`,
      headers: [
        { key: 'class', label: 'Class', sortable: false },
        { key: 'instructor', label: 'Instructor', sortable: false },
      ],
      data: classes,
      loading: loadingClasses,
      onRowClick: (item) => router.push(`/${clubYearLabel}/classes/${item.id}`),
    },

    {
      title: 'Awards',
      description: `${awards.length} offered in ${clubYearLabel}`,
      href: `/${clubYearLabel}/awards`,
      badge: awards?.length ?? 0,
      headers: [
        { key: 'name', label: 'Name', sortable: false },
        { key: 'level', label: 'Level', sortable: false },
        { key: 'class', label: 'Class', sortable: false },
      ],
      data: awards,
      loading: loadingAwards,
      onRowClick: (item) => router.push(`/${clubYearLabel}/awards/${item.id}`),
    },
  ]

  return <DashboardPage breadcrumbs={breadcrumbs} actions={actions} cards={cards} />
}

export default View
