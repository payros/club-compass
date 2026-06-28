'use client'
import { useParams, useRouter } from 'next/navigation'

import ResourcePage from '@/components/pages/ResourcePage'
import { fromDateToString } from '@/utils/dateUtils'
import useEvent from '@/hooks/useEvent'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

export default function View() {
  const { club_year_label: clubYearLabel, event_id: eventId } = useParams()
  const router = useRouter()

  const { event, loadingEvent } = useEvent(clubYearLabel, eventId)

  const breadcrumbs = [{ label: 'Events', href: `/${clubYearLabel}/events` }, { label: event?.title ?? 'Event' }]

  const fields = event
    ? [
        { label: 'Date', value: event.eventDate ? fromDateToString(event.eventDate) : '—' },
        { label: 'Award Ceremony', value: event.awardCeremony ? 'Yes' : 'No' },
        { label: 'Number of Attendees', value: event.children?.length ?? 0 },
        { label: 'Number of Awards', value: event.awards?.length ?? 0 },
      ]
    : []

  const actions = [
    {
      label: 'Edit Event',
      href: `/${clubYearLabel}/events/${eventId}/edit`,
    },
    {
      label: 'Roll Call',
      href: `/${clubYearLabel}/events/${eventId}/roll-call`,
    },
  ]

  const relatedCards = [
    {
      title: 'Attendees',
      headers: [{ key: 'name', label: 'Name', sortable: false }],
      data:
        event?.children?.map((a) => ({
          id: a.id,
          name: `${a.firstName ?? a.first_name} ${a.lastName ?? a.last_name}`,
        })) ?? [],
      loading: loadingEvent,
      onRowClick: (item) => router.push(`/${clubYearLabel}/adventurers/${item.id}`),
    },
    {
      title: 'Awards',
      width: 'medium',
      headers: [
        { key: 'patchImageUrl', label: '', type: 'image', sortable: false },
        { key: 'name', label: 'Award Name', sortable: false },
        { key: 'class', label: 'Class', sortable: false },
      ],
      data:
        event?.awards?.map((a) => ({
          id: a.id,
          patchImageUrl: a.patchImageUrl ?? null,
          name: a.name,
          class: fromSnakeCaseToTitleCase(a.class),
        })) ?? [],
      loading: loadingEvent,
    },
  ]

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      title={event?.title ?? 'Event'}
      loading={loadingEvent}
      fields={fields}
      relatedCards={relatedCards}
      actions={actions}
    />
  )
}
