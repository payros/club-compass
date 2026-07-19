'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import EventsForm from '@/components/forms/EventsForm'
import { localDateToISO } from '@/utils/dateUtils'

const View = () => {
  const router = useRouter()
  const { club_year_label: clubYearLabel } = useParams()
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setGlobalError(null)

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
    data.awards = JSON.parse(data.event_awards || '[]')
    delete data.event_awards
data.event_date = localDateToISO(data.event_date)

    setLoading(true)
    try {
      const response = await fetch(`/api/club-years/${clubYearLabel}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message = result?.error ?? 'The event could not be created. Please try again.'
        console.error('Create event POST failed:', message)
        setGlobalError(message)
        setLoading(false)
        return
      }

      const result = await response.json()
      router.push(`/${clubYearLabel}/events/${result.id}`)
    } catch (error) {
      console.error('Create event submission error:', error)
      setGlobalError('The event could not be created. Please try again.')
      setLoading(false)
    }
  }

  const breadcrumbs = [{ label: 'Events', href: `/${clubYearLabel}/events` }, { label: 'New Event' }]

  return (
    <FormPage
      title="New Event"
      description="Fill in the information below to add a new event."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Create Event"
      submitLoadingLabel="Creating Event…"
      loading={loading}
    >
      <EventsForm />
    </FormPage>
  )
}

export default View
