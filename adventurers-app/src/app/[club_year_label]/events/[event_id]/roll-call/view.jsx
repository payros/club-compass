'use client'
import { Button, Card, Stack, Checkbox, Box, CheckboxGroup, Fieldset, Heading, Alert } from '@chakra-ui/react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import useChildren from '@/hooks/useChildren'
import PageLayout from '@/components/PageLayout'
import PageTransition from '@/components/PageTransition'

const View = () => {
  const router = useRouter()
  const clubYearLabel = useParams()['club_year_label']
  const eventId = useParams()['event_id']
  const { children, loadingChildren } = useChildren(clubYearLabel, {
    by: null,
    direction: 'asc',
  })
  const [eventData, setEventData] = useState(null)
  const [loadingEvent, setLoadingEvent] = useState(false)
  const [selectedChildren, setSelectedChildren] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    setLoadingEvent(true)
    fetch(`/api/club-years/${clubYearLabel}/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEventData(data)
        setSelectedChildren(data.children.map((child) => child.id) || [])
        setLoadingEvent(false)
      })
  }, [clubYearLabel, eventId])

  async function handleSubmit(event) {
    event.preventDefault()
    setGlobalError(null)
    setSubmitting(true)

    try {
      const response = await fetch(`/api/club-years/${clubYearLabel}/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          children: selectedChildren,
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message = result?.error ?? 'Roll call could not be submitted. Please try again.'
        console.error('Roll call PATCH failed:', message)
        setGlobalError(message)
        return
      }

      router.push(`/${clubYearLabel}/events/${eventId}`)
    } catch (error) {
      console.error('Roll call submission error:', error)
      setGlobalError('Roll call could not be submitted. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCheckboxChange(childId, isChecked) {
    setSelectedChildren((prev) => (isChecked ? [...prev, childId] : prev.filter((id) => id !== childId)))
  }

  const classes = children.reduce((acc, child) => {
    if (!acc.includes(child.class)) {
      acc.push(child.class)
    }
    return acc
  }, [])

  const breadcrumbs = [
    { label: clubYearLabel, href: `/${clubYearLabel}/dashboard` },
    { label: 'Events', href: `/${clubYearLabel}/events` },
    { label: eventData?.title ?? 'Event', href: `/${clubYearLabel}/events/${eventId}` },
    { label: 'Roll Call' },
  ]

  return (
    <PageLayout breadcrumbs={breadcrumbs} clubName={`${clubYearLabel} Club`}>
      <PageTransition>
        <div style={{ maxWidth: 480, margin: '2rem auto' }}>
          <Card.Root className="glass-card">
            <Card.Header>
              <Card.Title className="card-title">Roll Call for {eventData?.title ?? 'Event'}</Card.Title>
              <Card.Description className="card-description">
                Select all the children who attended this event. Awards will be distributed based on attendance.
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
                <Fieldset.Root size="lg" maxW="md">
                  <Fieldset.Content>
                    <Stack direction="column" gap="2">
                      <CheckboxGroup>
                        {classes.map((className) => (
                          <Box key={className} p="2">
                            <Heading fontWeight="bold" size="md">
                              {fromSnakeCaseToTitleCase(className)}
                            </Heading>
                            <Stack direction="column" gap="1" mt="2">
                              {children
                                .filter((child) => child.class === className)
                                .map((child) => (
                                  <Checkbox.Root
                                    key={child.id}
                                    checked={selectedChildren.includes(child.id)}
                                    onCheckedChange={(e) => handleCheckboxChange(child.id, !!e.checked)}
                                  >
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control />
                                    <Checkbox.Label>{child.name}</Checkbox.Label>
                                  </Checkbox.Root>
                                ))}
                            </Stack>
                          </Box>
                        ))}
                      </CheckboxGroup>
                    </Stack>
                  </Fieldset.Content>

                  <Button
                    type="submit"
                    mt={4}
                    colorPalette="accent"
                    disabled={submitting}
                    loading={submitting}
                    loadingText="Submitting…"
                  >
                    Submit Roll Call
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
