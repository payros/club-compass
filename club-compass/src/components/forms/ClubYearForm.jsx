'use client'
import { Field, Input } from '@chakra-ui/react'

const ClubYearForm = ({ data = {}, labelError = null }) => {
  const startDate = data.startDate ?? data.start_date
  const endDate = data.endDate ?? data.end_date

  return (
    <>
      <Field.Root>
        <Field.Label>Club Name</Field.Label>
        <Input
          name="clubName"
          placeholder="Enter the official name of your club"
          defaultValue={data.clubName ?? data.club_name ?? ''}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Church Name</Field.Label>
        <Input
          name="churchName"
          placeholder="Enter the name of your church"
          defaultValue={data.churchName ?? data.church_name ?? ''}
        />
      </Field.Root>
      <Field.Root invalid={!!labelError}>
        <Field.Label>Year Label</Field.Label>
        <Input name="label" placeholder="e.g. 2025-2026" defaultValue={data.label ?? ''} />
        {labelError && <Field.ErrorText>{labelError}</Field.ErrorText>}
      </Field.Root>
      <Field.Root>
        <Field.Label>Start Date</Field.Label>
        <Input name="startDate" type="date" defaultValue={startDate ? String(startDate).slice(0, 10) : ''} />
      </Field.Root>
      <Field.Root>
        <Field.Label>End Date</Field.Label>
        <Input name="endDate" type="date" defaultValue={endDate ? String(endDate).slice(0, 10) : ''} />
      </Field.Root>
    </>
  )
}

export default ClubYearForm
