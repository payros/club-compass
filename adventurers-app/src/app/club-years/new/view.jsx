'use client'
import { Button, Field, Fieldset, Input, Card, Spinner, Alert } from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import PageTransition from '@/components/PageTransition'

const View = () => {
  const router = useRouter()
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
        return
      }
      if (result?.[0]?.label) router.push(`/${result[0].label}/dashboard`)
    } catch (err) {
      console.error(err)
      setGlobalError('The form could not be submitted due to an error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [{ label: 'Club Years', href: '/club-years' }, { label: 'New Club Year' }]

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <PageTransition>
        <div style={{ maxWidth: 480, margin: '2rem auto' }}>
          <Card.Root className="glass-card">
            <Card.Header>
              <Card.Title className="card-title">New Club Year</Card.Title>
              <Card.Description className="card-description">
                Fill in the information below to create a new club year.
              </Card.Description>
            </Card.Header>
            {globalError && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Description>{globalError}</Alert.Description>
              </Alert.Root>
            )}
            <Card.Body>
              <form onSubmit={handleSubmit}>
                <Fieldset.Root size="lg">
                  <Fieldset.Content>
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
                  </Fieldset.Content>
                  <Button
                    type="submit"
                    mt={4}
                    colorPalette="accent"
                    disabled={loading}
                    loading={loading}
                    loadingText="Creating Club Year…"
                  >
                    Create Club Year
                  </Button>
                </Fieldset.Root>
              </form>
            </Card.Body>
          </Card.Root>
        </div>
      </PageTransition>
    </PageLayout>
  )
}

export default View
