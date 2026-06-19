'use client'
import { Button, Field, Input, Switch, IconButton, Portal, Select, createListCollection } from '@chakra-ui/react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { FaRegTrashAlt } from 'react-icons/fa'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import FormPage from '@/components/pages/FormPage'
import SearchBox from '@/components/SearchBox'

const View = () => {
  const router = useRouter()
  const clubYearLabel = useParams()['club_year_label']
  const [eventAwards, setEventAwards] = useState([])
  const [awardList, setAwardList] = useState([])
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
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  const fetchAwards = async () => {
    try {
      const response = await fetch(`/api/awards`)
      const data = await response.json()
      setAwardList(data)
    } catch (error) {
      console.error('Error fetching awards:', error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/club-years/${clubYearLabel}/classes`)
      const data = await response.json()
      setClassList(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  // get all awards
  useMemo(() => fetchAwards(), [])

  // get all classes
  useMemo(() => fetchClasses(), [])

  async function handleSubmit(event) {
    event.preventDefault()
    setGlobalError(null)

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    // Expand awards with multiple class selections into separate entries
    const expandedAwards = []
    for (const award of eventAwards) {
      if (award.class_ids && award.class_ids.length > 0) {
        for (const classId of award.class_ids) {
          expandedAwards.push({ award_id: award.award_id, class_id: classId })
        }
      } else {
        expandedAwards.push({ award_id: award.award_id, class_id: null })
      }
    }
    data.awards = expandedAwards

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
      clubName={`${clubYearLabel} Club`}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Create Event"
      submitLoadingLabel="Creating Event…"
      loading={loading}
    >
      <Field.Root>
        <Field.Label>Event Name</Field.Label>
        <Input name="title" placeholder={'Enter the name of your event'} />
      </Field.Root>

      <Field.Root>
        <Field.Label>Event Date</Field.Label>
        <Input name="event_date" type="date" />
      </Field.Root>

      <Field.Root>
        <Field.Label>Is Award Ceremony?</Field.Label>
        <Switch.Root name="award_ceremony" defaultChecked={false}>
          <Switch.HiddenInput />
          <Switch.Control />
        </Switch.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label>Awards</Field.Label>
        {eventAwards.map((eventAward, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', width: '100%' }}>
            <SearchBox
              type="award"
              name={`award-${index}`}
              placeholder="Select Award"
              style={{ flex: 1 }}
              handleSelect={(award) => {
                const newAwards = [...eventAwards]
                newAwards[index].award_id = award.id
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
                  newAwards[index].class_ids = allSelected ? [] : allIds
                } else {
                  newAwards[index].class_ids = value
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

export default View
