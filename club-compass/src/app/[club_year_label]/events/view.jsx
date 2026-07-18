'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import useEvents from '@/hooks/useEvents'
import CollectionPage from '@/components/pages/CollectionPage'

const headers = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'eventDate', label: 'Date', sortable: true },
  { key: 'awardCeremony', label: 'Award Ceremony', sortable: false },
]

export default function View() {
  const clubYearLabel = useParams()['club_year_label']
  const router = useRouter()
  const [sort, setSort] = useState({ by: null, direction: 'asc' })
  const { events, loadingEvents } = useEvents(clubYearLabel, sort)

  const displayEvents = events?.map((e) => ({
    ...e,
    awardCeremony: e.awardCeremony ? 'Yes' : 'No',
  }))

  function handleSort(by) {
    setSort((prev) => ({
      by,
      direction: prev.by === by && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const breadcrumbs = [{ label: 'Events' }]

  const actions = [
    {
      label: 'Add Event',
      href: `/${clubYearLabel}/events/new`,
    },
  ]
  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      title="Events"
      description={`All events for the ${clubYearLabel} club year`}
      headers={headers}
      data={displayEvents}
      loading={loadingEvents}
      badge={events?.length ?? 0}
      sortBy={sort.by}
      sortDirection={sort.direction}
      handleSort={handleSort}
      actions={actions}
      onRowClick={(item) => router.push(`/${clubYearLabel}/events/${item.id}`)}
    />
  )
}
