'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button, Field, Input, IconButton } from '@chakra-ui/react'
import { FaRegTrashAlt } from 'react-icons/fa'
import FormPage from '@/components/pages/FormPage'
import SearchBox from '@/components/SearchBox'

function toDateInputValue(ts) {
  if (!ts) return ''
  return new Date(ts).toISOString().split('T')[0]
}

function emptyEntry() {
  return {
    awardId: null,
    awardName: '',
    eventId: null,
    eventTitle: '',
    awardCeremonyId: null,
    awardCeremonyTitle: '',
    awardedOn: '',
  }
}

export default function View() {
  const { id: childId } = useParams()
  const router = useRouter()
  const [childName, setChildName] = useState('Adventurer')
  const [awards, setAwards] = useState([])
  const [contentLoading, setContentLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    async function load() {
      const [childRes, awardsRes] = await Promise.all([
        fetch(`/api/children/${childId}`),
        fetch(`/api/children/${childId}/awards`),
      ])
      if (childRes.ok) {
        const child = await childRes.json()
        setChildName(`${child.firstName} ${child.lastName}`)
      }
      if (awardsRes.ok) {
        const data = await awardsRes.json()
        setAwards(
          data.map((a) => ({
            awardId: a.awardId ?? null,
            awardName: a.awardName ?? '',
            eventId: a.eventId ?? null,
            eventTitle: a.eventTitle ?? '',
            awardCeremonyId: a.awardCeremonyId ?? null,
            awardCeremonyTitle: a.awardCeremonyTitle ?? '',
            awardedOn: toDateInputValue(a.awardedOn),
          }))
        )
      }
      setContentLoading(false)
    }
    load()
  }, [childId])

  const breadcrumbs = [
    { label: 'Children', href: '/children' },
    { label: childName, href: `/children/${childId}` },
    { label: 'Edit Awards' },
  ]

  function updateAward(index, patch) {
    setAwards((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      return next
    })
  }

  function removeAward(index) {
    setAwards((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGlobalError(null)

    const hasInvalidAward = awards.some((a) => !a.awardId)
    if (hasInvalidAward) {
      setGlobalError('Each award row requires an award selection.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/children/${childId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awards: awards.map((a) => ({
            awardId: a.awardId,
            eventId: a.eventId ?? null,
            awardCeremonyId: a.awardCeremonyId ?? null,
            awardedOn: a.awardedOn || null,
          })),
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        setGlobalError(result?.error ?? 'Could not save awards. Please try again.')
        setLoading(false)
        return
      }

      router.back()
    } catch {
      setGlobalError('Could not save awards. Please try again.')
      setLoading(false)
    }
  }

  return (
    <FormPage
      title="Edit Awards"
      description={`Manage the awards for ${childName}.`}
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Save Awards"
      submitLoadingLabel="Saving…"
      loading={loading}
      contentLoading={contentLoading}
      maxWidth={900}
    >
      {awards.map((entry, index) => (
        <div
          key={index}
          style={{ display: 'flex', gap: '8px', marginBottom: '8px', width: '100%', alignItems: 'flex-end' }}
        >
          <Field.Root required style={{ flex: 2 }}>
            <Field.Label>Award</Field.Label>
            <SearchBox
              type="award"
              placeholder="Search award…"
              value={entry.awardName}
              handleSelect={(award) => {
                updateAward(index, { awardId: award.id, awardName: award.name })
              }}
            />
          </Field.Root>

          <Field.Root style={{ flex: 2 }}>
            <Field.Label>Event</Field.Label>
            <SearchBox
              type="event"
              placeholder="Search event…"
              value={entry.eventTitle}
              extraQueryParams={{ is_award_ceremony: false }}
              handleSelect={(event) => {
                updateAward(index, { eventId: event.id, eventTitle: event.title })
              }}
            />
          </Field.Root>

          <Field.Root style={{ flex: 2 }}>
            <Field.Label>Awarded On</Field.Label>
            <SearchBox
              type="event"
              placeholder="Search ceremony…"
              value={entry.awardCeremonyTitle}
              extraQueryParams={{ is_award_ceremony: true }}
              handleSelect={(event) => {
                const patch = { awardCeremonyId: event.id, awardCeremonyTitle: event.title }
                if (!entry.awardedOn && event.eventDate) {
                  patch.awardedOn = toDateInputValue(event.eventDate)
                }
                updateAward(index, patch)
              }}
            />
          </Field.Root>

          <Field.Root style={{ flex: 1, minWidth: '140px' }}>
            <Field.Label>Awarded Date</Field.Label>
            <Input
              type="date"
              value={entry.awardedOn}
              onChange={(e) => updateAward(index, { awardedOn: e.target.value })}
            />
          </Field.Root>

          <IconButton
            variant="ghost"
            aria-label="Remove Award"
            type="button"
            onClick={() => removeAward(index)}
            style={{ flexShrink: 0, marginBottom: '2px' }}
          >
            <FaRegTrashAlt />
          </IconButton>
        </div>
      ))}

      <Button
        size="sm"
        variant="outline"
        colorPalette="brand"
        type="button"
        onClick={() => setAwards((prev) => [...prev, emptyEntry()])}
      >
        Add Award
      </Button>
    </FormPage>
  )
}
