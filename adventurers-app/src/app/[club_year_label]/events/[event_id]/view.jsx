'use client'
import { AbsoluteCenter, Button, Flex, Heading, Stack } from '@chakra-ui/react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import TableCard from '@/components/TableCard'
import { handleSorting, sortRecordsInAlphabeticalOrder } from '@/utils/tableUtils'
import Link from 'next/link'

// Colocar cartão e tabela com informações do clube

const View = () => {
  const childrenHeaders = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'class', label: 'Class', sortable: true },
  ]

  const awardsHeaders = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'class', label: 'Class ', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
  ]

  const clubYearLabel = useParams()['club_year_label']
  const eventId = useParams()['event_id']

  const [loadingEvent, setLoadingEvent] = useState(false)
  const [eventData, setEventData] = useState(null)
  const [sortBy, setSortBy] = useState({
    children: { by: null, direction: 'asc' },
    awards: { by: null, direction: 'asc' },
  })

  useEffect(() => {
    if (eventData) {
      setEventData((prevData) => {
        const sortedChildren = sortRecordsInAlphabeticalOrder(
          sortBy.children.by,
          sortBy.children.direction,
          eventData.children
        )
        return {
          ...prevData,
          children: sortedChildren,
        }
      })
    }
  }, [sortBy.children])

  useEffect(() => {
    if (eventData) {
      setEventData((prevData) => {
        const sortedAwards = sortRecordsInAlphabeticalOrder(sortBy.awards.by, sortBy.awards.direction, eventData.awards)
        return {
          ...prevData,
          awards: sortedAwards,
        }
      })
    }
  }, [sortBy.awards])

  useEffect(() => {
    setLoadingEvent(true)
    fetch(`/api/club-years/${clubYearLabel}/events/${eventId}`)
      .then((res) => res.json())
      .then((rawData) => {
        const modifiedData = {
          ...rawData,
          children: rawData.children.map((child) => ({
            ...child,
            name: `${child.firstName} ${child.lastName}`,
            class: fromSnakeCaseToTitleCase(child.class),
          })),
          awards: rawData.awards.map((award) => ({
            ...award,
            class: fromSnakeCaseToTitleCase(award.class),
            type: fromSnakeCaseToTitleCase(award.type),
          })),
        }
        setEventData(modifiedData)
        setLoadingEvent(false)
      })
  }, [clubYearLabel, eventId])

  //******************
  // Render the dashboard view **********
  //******************

  return (
    <AbsoluteCenter>
      <Stack direction="column" gap="4" mb="4">
        <Heading size="4xl">{eventData?.title ?? 'Event Details'}</Heading>

        <Flex gap="4" mb="4" justify="flex-end">
          <Link href={`/${clubYearLabel}/events/${eventId}/roll-call`}>
            <Button>Roll Call</Button>
          </Link>
        </Flex>

        <Flex direction="row" gap="4">
          <TableCard
            title="Children"
            headers={childrenHeaders}
            data={eventData?.children ?? []}
            loading={loadingEvent}
            sortBy={sortBy.children.by}
            sortDirection={sortBy.children.direction}
            handleSort={(by) => handleSorting(by, 'children', setSortBy)}
          ></TableCard>
          <TableCard
            title="Awards"
            headers={awardsHeaders}
            data={eventData?.awards ?? []}
            loading={loadingEvent}
            sortBy={sortBy.awards.by}
            sortDirection={sortBy.awards.direction}
            handleSort={(by) => handleSorting(by, 'awards', setSortBy)}
          ></TableCard>
        </Flex>
      </Stack>
    </AbsoluteCenter>
  )
}

export default View
