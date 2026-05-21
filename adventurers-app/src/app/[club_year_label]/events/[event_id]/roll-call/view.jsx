'use client'
import {
  Button,
  Field,
  Fieldset,
  FieldRoot,
  Input,
  AbsoluteCenter,
  Card,
  Stack,
  Checkbox,
  IconButton,
  Box,
  CheckboxGroup,
  Heading,
} from '@chakra-ui/react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaRegTrashAlt } from 'react-icons/fa'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import useChildren from '@/hooks/useChildren'

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

  function handleSubmit(event) {
    event.preventDefault()

    fetch(`/api/club-years/${clubYearLabel}/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        children: selectedChildren,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data)
        router.push(`/${clubYearLabel}/events/${eventId}`)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
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

  return (
    <AbsoluteCenter>
      <Card.Root maxW="sm">
        <Card.Header>
          <Card.Title>Roll Call for {eventData?.title ?? 'Event'}</Card.Title>
          <Card.Description>
            Select all the children who attented this event. Awards will be distributed based on attendance.
          </Card.Description>
        </Card.Header>
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

              <Button type="submit" alignSelf="flex-start" mt="4">
                Submit
              </Button>
            </Fieldset.Root>
          </form>
        </Card.Body>
      </Card.Root>
    </AbsoluteCenter>
  )
}

export default View
