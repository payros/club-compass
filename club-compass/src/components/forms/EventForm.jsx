'use client'
import { useState, useMemo } from 'react'
import { Button, Field, Input, Switch, IconButton, Portal, Select, createListCollection } from '@chakra-ui/react'
import { useParams } from 'next/navigation'
import { FaRegTrashAlt } from 'react-icons/fa'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import SearchBox from '@/components/SearchBox'

const EventForm = ({ data = {} }) => {
  const { club_year_label: clubYearLabel } = useParams()
  const isEdit = Boolean(data.title || data.eventDate)
  const [eventAwards, setEventAwards] = useState(data.eventAwards ?? [])
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

  return (
    <>
      <input type="hidden" name="event_awards" value={JSON.stringify(expandedAwards)} readOnly />

      <Field.Root>
        <Field.Label>Event Name</Field.Label>
        <Input name="title" placeholder="Enter the name of your event" defaultValue={data.title ?? ''} />
      </Field.Root>

      <Field.Root>
        <Field.Label>Event Date</Field.Label>
        <Input
          name="event_date"
          type="date"
          defaultValue={data.eventDate ? data.eventDate.toISOString().slice(0, 10) : ''}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>Is Award Ceremony?</Field.Label>
        <Switch.Root name="award_ceremony" defaultChecked={data.awardCeremony ?? false} disabled={isEdit}>
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
    </>
  )
}

export default EventForm
