'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import EventForm from '@/components/forms/EventForm'
import { localDateToISO } from '@/utils/dateUtils'

export default function View({ event }) {
  const { club_year_label: clubYearLabel, event_id: eventId } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  async function handleSubmit(formEvent) {
    formEvent.preventDefault()
    setGlobalError(null)
    setLoading(true)

    const formData = new FormData(formEvent.target)
    const data = Object.fromEntries(formData.entries())
    data.event_date = localDateToISO(data.event_date)

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
    >
      <EventForm data={event} />
    </FormPage>
  )
}
