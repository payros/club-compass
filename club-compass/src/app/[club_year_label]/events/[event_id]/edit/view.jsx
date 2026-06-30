'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import EventsForm from '@/components/forms/EventsForm'

export default function View() {
  const { club_year_label: clubYearLabel, event_id: eventId } = useParams()
  const router = useRouter()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(true)
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await fetch(`/api/club-years/${clubYearLabel}/events/${eventId}`)
        if (!res.ok) throw new Error('Event not found')
        const eventData = await res.json()

        // Group awards by award_id to build { award_id, name, class_ids[] } — used by formData below
        const awardsMap = new Map()
        for (const award of eventData.awards ?? []) {
          if (!awardsMap.has(award.id)) {
            awardsMap.set(award.id, { award_id: award.id, name: award.name, class_ids: [] })
          }
          if (award.classId !== null && award.classId !== undefined) {
            awardsMap.get(award.id).class_ids.push(String(award.classId))
          }
        }
        eventData.eventAwardsForForm = Array.from(awardsMap.values())

        setEvent(eventData)
      } catch {
        setGlobalError('Could not load event data. Please try again.')
      } finally {
        setContentLoading(false)
      }
    }
    fetchEventData()
  }, [clubYearLabel, eventId])

  async function handleSubmit(formEvent) {
    formEvent.preventDefault()
    setGlobalError(null)
    setLoading(true)

    const formData = new FormData(formEvent.target)
    const data = Object.fromEntries(formData.entries())
    data.awards = JSON.parse(data.event_awards || '[]')
    delete data.event_awards

    try {
      const response = await fetch(`/api/club-years/${clubYearLabel}/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message = result?.error ?? 'The event could not be updated. Please try again.'
        console.error('Edit event PATCH failed:', message)
        setGlobalError(message)
        setLoading(false)
        return
      }

      router.push(`/${clubYearLabel}/events/${eventId}`)
    } catch (error) {
      console.error('Edit event submission error:', error)
      setGlobalError('The event could not be updated. Please try again.')
      setLoading(false)
    }
  }

  const formData = event
    ? {
        title: event.title,
        eventDate: event.eventDate,
        awardCeremony: event.awardCeremony,
        eventAwards: event.eventAwardsForForm ?? [],
      }
    : null

  const breadcrumbs = [
    { label: 'Events', href: `/${clubYearLabel}/events` },
    { label: event?.title ?? 'Event', href: `/${clubYearLabel}/events/${eventId}` },
    { label: 'Edit' },
  ]

  return (
    <FormPage
      title="Edit Event"
      description="Update the event details below."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Save Changes"
      submitLoadingLabel="Saving…"
      loading={loading}
      contentLoading={contentLoading}
    >
      {formData && <EventsForm data={formData} />}
    </FormPage>
  )
}
