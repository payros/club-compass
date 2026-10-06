'use client'
import { useParams, useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import { localDateToISO } from '@/utils/dateUtils'
import { useFlow } from '@/hooks/useFlow'
import { FaRegTrashAlt } from 'react-icons/fa'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import SearchBox from '@/components/SearchBox'
import { useState, useMemo } from 'react'
import { Button, Field, IconButton, Portal, Select, createListCollection } from '@chakra-ui/react'

function buildEventAwardsForForm(eventData) {
  const awardsMap = new Map()
  for (const award of eventData.awards ?? []) {
    if (!awardsMap.has(award.id)) {
      awardsMap.set(award.id, { award_id: award.id, name: award.name, class_ids: [] })
    }
    if (award.classId !== null && award.classId !== undefined) {
      awardsMap.get(award.id).class_ids.push(String(award.classId))
    }
  }
  return Array.from(awardsMap.values())
}

export default function View({ event }) {
  const { club_year_label: clubYearLabel, event_id: eventId } = useParams()
  const router = useRouter()
  const { getNextPath, current, total } = useFlow()
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)
  const [eventAwards, setEventAwards] = useState(buildEventAwardsForForm(event) ?? [])
  const [classList, setClassList] = useState([])

  const classCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'All Classes', value: 'all' },
          ...classList.map((c) => ({ label: fromSnakeCaseToTitleCase(c.class), value: String(c.id) })),
        ],
      }),
    [classList]
  )

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/club-years/${clubYearLabel}/classes`)
      const classData = await response.json()
      setClassList(classData)
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  // fetch classes on mount
  useMemo(() => fetchClasses(), [])

  const expandedAwards = useMemo(() => {
    const result = []
    for (const award of eventAwards) {
      if (award.class_ids && award.class_ids.length > 0) {
        for (const classId of award.class_ids) {
          result.push({ award_id: award.award_id, class_id: classId })
        }
      } else {
        result.push({ award_id: award.award_id, class_id: null })
      }
    }
    return result
  }, [eventAwards])

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
      const nextPath = getNextPath?.({ club_year_label: clubYearLabel, event_id: eventId })
      router.push(nextPath ?? `/${clubYearLabel}/events/${eventId}`)
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
    { label: 'Roll Call' },
  ]

  return (
    <FormPage
      title={`Roll Call for ${event?.title ?? 'Event'}`}
      description="Please review and update the event awards below prior to the roll call."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Confirm Event Awards"
      submitLoadingLabel="Saving…"
      loading={loading}
      current={current}
      total={total}
    >
      <input type="hidden" name="event_awards" value={JSON.stringify(expandedAwards)} readOnly />
      <Field.Root>
        <Field.Label>Awards</Field.Label>
        {eventAwards.map((eventAward, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', width: '100%' }}>
            <SearchBox
              type="award"
              name={`award-${index}`}
              placeholder="Select Award"
              style={{ flex: 1 }}
              value={eventAward.name ?? ''}
              handleSelect={(award) => {
                const newAwards = [...eventAwards]
                newAwards[index] = { ...newAwards[index], award_id: award.id, name: award.name }
                setEventAwards(newAwards)
              }}
            />
            <Select.Root
              multiple
              collection={classCollection}
              size="sm"
              width="180px"
              value={eventAward.class_ids || []}
              onValueChange={({ value }) => {
                const newAwards = [...eventAwards]
                if (value.includes('all')) {
                  const allIds = classList.map((c) => String(c.id))
                  const currentIds = newAwards[index].class_ids || []
                  const allSelected = allIds.every((id) => currentIds.includes(id))
                  newAwards[index] = { ...newAwards[index], class_ids: allSelected ? [] : allIds }
                } else {
                  newAwards[index] = { ...newAwards[index], class_ids: value }
                }
                setEventAwards(newAwards)
              }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select Class" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {classCollection.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
            <IconButton
              variant="ghost"
              aria-label="Remove Award"
              onClick={() => {
                const newAwards = [...eventAwards]
                newAwards.splice(index, 1)
                setEventAwards(newAwards)
              }}
            >
              <FaRegTrashAlt />
            </IconButton>
          </div>
        ))}

        <Button
          size="sm"
          variant="outline"
          colorPalette="brand"
          onClick={() => setEventAwards([...eventAwards, { award_id: null, class_ids: [] }])}
        >
          Add Award
        </Button>
      </Field.Root>
    </FormPage>
  )
}
