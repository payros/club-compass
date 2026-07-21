'use client'
import { Field, Input } from '@chakra-ui/react'

const ClubYearForm = ({ data = {}, labelError = null }) => {
  const startDate = data.startDate
  const endDate = data.endDate

  return (
    <>
      <Field.Root required>
        <Field.Label>
          Club Name <Field.RequiredIndicator />
        </Field.Label>
        <Input name="clubName" placeholder="Enter the official name of your club" defaultValue={data.clubName ?? ''} />
      </Field.Root>
      <Field.Root>
        <Field.Label>Church Name</Field.Label>
        <Input name="churchName" placeholder="Enter the name of your church" defaultValue={data.churchName ?? ''} />
      </Field.Root>
      <Field.Root invalid={!!labelError} required>
        <Field.Label>
          Year Label <Field.RequiredIndicator />
        </Field.Label>
        <Input name="label" placeholder="e.g. 2025-2026" defaultValue={data.label ?? ''} />
        {labelError && <Field.ErrorText>{labelError}</Field.ErrorText>}
      </Field.Root>
      <Field.Root>
        <Field.Label>Start Date</Field.Label>
        <Input name="startDate" type="date" defaultValue={startDate ? startDate.toISOString().slice(0, 10) : ''} />
      </Field.Root>
      <Field.Root>
        <Field.Label>End Date</Field.Label>
        <Input name="endDate" type="date" defaultValue={endDate ? endDate.toISOString().slice(0, 10) : ''} />
      </Field.Root>
    </>
  )
}

export default ClubYearForm
