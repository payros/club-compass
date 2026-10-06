'use client'
import { Field, Input, Switch } from '@chakra-ui/react'

const EventForm = ({ data = {} }) => {
  const isEdit = Boolean(data.title || data.eventDate)

  return (
    <>
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
    </>
  )
}

export default EventForm
