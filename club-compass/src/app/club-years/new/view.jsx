'use client'
import { Field, Input } from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import { useFlow } from '@/hooks/useFlow'

const View = () => {
  const router = useRouter()
  const { getNextPath, current, total } = useFlow()
  const [loading, setLoading] = useState(false)
  const [labelError, setLabelError] = useState(null)
  const [globalError, setGlobalError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setLabelError(null)
    setGlobalError(null)
    setLoading(true)
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('/api/club-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        if (result?.field === 'label') {
          setLabelError(result.error)
        } else {
          setGlobalError(result?.error ?? 'The form could not be submitted due to an error. Please try again later.')
        }
        setLoading(false)
        return
      }
      if (result?.[0]?.label) {
        const label = result[0].label
        const nextPath = getNextPath?.({ club_year_label: label })
        router.push(nextPath ?? `/${label}/dashboard`)
      }
    } catch (err) {
      console.error(err)
      setGlobalError('The form could not be submitted due to an error. Please try again.')
      setLoading(false)
    }
  }

  const breadcrumbs = [{ label: 'Club Years', href: '/club-years' }, { label: 'New Club Year' }]

  return (
    <FormPage
      title="New Club Year"
      description="Fill in the information below to create a new club year."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Create Club Year"
      submitLoadingLabel="Creating Club Year…"
      loading={loading}
      current={current}
      total={total}
    >
      <Field.Root>
        <Field.Label>Club Name</Field.Label>
        <Input name="clubName" placeholder="Enter the official name of your club" />
      </Field.Root>
      <Field.Root invalid={!!labelError}>
        <Field.Label>Year Label</Field.Label>
        <Input name="label" placeholder="e.g. 2025-2026" />
        {labelError && <Field.ErrorText>{labelError}</Field.ErrorText>}
      </Field.Root>
      <Field.Root>
        <Field.Label>Start Date</Field.Label>
        <Input name="startDate" type="date" />
      </Field.Root>
      <Field.Root>
        <Field.Label>End Date</Field.Label>
        <Input name="endDate" type="date" />
      </Field.Root>
    </FormPage>
  )
}

export default View
