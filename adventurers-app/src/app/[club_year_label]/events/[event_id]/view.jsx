"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ResourcePage from "@/components/pages/ResourcePage"
import { fromDateToString } from "@/utils/dateUtils"

export default function View() {
  const { club_year_label: clubYearLabel, event_id: eventId } = useParams()
  const router = useRouter()

  const [event, setEvent] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAttendees, setLoadingAttendees] = useState(true)

  useEffect(() => {
    fetch(`/api/club-years/${clubYearLabel}/events/${eventId}`)
      .then(r => r.json())
      .then(data => { setEvent(data); setLoading(false) })
      .catch(() => setLoading(false))

    fetch(`/api/club-years/${clubYearLabel}/events/${eventId}/attendees`)
      .then(r => r.json())
      .then(data => { setAttendees(data); setLoadingAttendees(false) })
      .catch(() => setLoadingAttendees(false))
  }, [clubYearLabel, eventId])

  const breadcrumbs = [
    { label: clubYearLabel, href: `/${clubYearLabel}/dashboard` },
    { label: "Events", href: `/${clubYearLabel}/events` },
    { label: event?.title ?? "Event" },
  ]

  const fields = event ? [
    { label: "Title", value: event.title },
    { label: "Date", value: event.eventDate ? fromDateToString(event.eventDate) : (event.event_date ? fromDateToString(event.event_date) : "—") },
    { label: "Award Ceremony", value: (event.awardCeremony ?? event.award_ceremony) ? "Yes" : "No" },
  ] : []

  const relatedCards = [
    {
      title: "Attendees",
      badge: attendees.length,
      headers: [
        { key: "name", label: "Name", sortable: false },
      ],
      data: attendees.map(a => ({
        id: a.id,
        name: `${a.firstName ?? a.first_name} ${a.lastName ?? a.last_name}`,
      })),
      loading: loadingAttendees,
      onRowClick: (item) => router.push(`/${clubYearLabel}/adventurers/${item.id}`),
    },
  ]

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      title={event?.title ?? "Event"}
      subtitle={`Club Year: ${clubYearLabel}`}
      loading={loading}
      fields={fields}
      relatedCards={relatedCards}
    />
  )
}
