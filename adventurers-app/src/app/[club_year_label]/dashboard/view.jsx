'use client'
import { AbsoluteCenter, Button, Flex } from '@chakra-ui/react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import useChildren from '@/hooks/useChildren'
import useEvents from '@/hooks/useEvents'
import TableCard from '@/components/TableCard'
import Link from 'next/link'
import { handleSorting } from '@/utils/tableUtils'
// Colocar cartão e tabela com informações do clube

const View = () => {
  const clubYearLabel = useParams()['club_year_label']

  const childrenHeaders = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'class', label: 'Class', sortable: true },
  ]

  const eventsHeaders = [
    { key: 'title', label: 'Title', sortable: true, link: (event) => `/${clubYearLabel}/events/${event.id}` },
    { key: 'eventDate', label: 'Date', sortable: true },
  ]

  const [sortBy, setSortBy] = useState({
    children: { by: null, direction: 'asc' },
    adventurerClass: { by: null, direction: 'asc' },
    events: { by: null, direction: 'asc' },
  })
  const { children, loadingChildren } = useChildren(clubYearLabel, sortBy.children)
  const { events, loadingEvents } = useEvents(clubYearLabel, sortBy.events)

  //******************
  // Render the dashboard view **********
  //******************

  return (
    <AbsoluteCenter>
      <Flex direction="column" gap="4" mb="4">
        <Flex gap="4" mb="4" justify="flex-end">
          <Link href={`/${clubYearLabel}/events/new`}>
            <Button>New Event</Button>
          </Link>
        </Flex>
        <Flex direction="row" gap="4">
          <TableCard
            title="Children"
            sortBy={sortBy.children.by}
            sortDirection={sortBy.children.direction}
            headers={childrenHeaders}
            data={children}
            loading={loadingChildren}
            handleSort={(by) => handleSorting(by, 'children', setSortBy)}
          ></TableCard>
          {/* <TableCard title="Class" sortBy={sortBy.adventurerClass.by} sortDirection={sortBy.adventurerClass.direction} headers={childrenHeaders} data={children} loading={loadingChildren} handleSort={(by) => handleSorting(by, 'adventurerClass')}></TableCard> */}
          <TableCard
            title="Events"
            sortBy={sortBy.events.by}
            sortDirection={sortBy.events.direction}
            headers={eventsHeaders}
            data={events}
            loading={loadingEvents}
            handleSort={(by) => handleSorting(by, 'events', setSortBy)}
          ></TableCard>
        </Flex>
      </Flex>
    </AbsoluteCenter>
  )
}

export default View
