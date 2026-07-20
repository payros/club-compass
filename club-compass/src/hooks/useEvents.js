import { useEffect, useState } from 'react'
import { fromDateToString } from '@/utils/dateUtils'

function useEvents(clubYearLabel, { by, direction }, initialData = null) {
  const [rawEvents, setRawEvents] = useState(initialData ?? [])
  const [events, setEvents] = useState(() => {
    if (!initialData) return []
    let list = initialData.map((event) => ({ ...event, eventDate: fromDateToString(event.eventDate) }))
    return list
  })
  const [loadingEvents, setLoadingEvents] = useState(initialData === null)

  function transformEventsData(rawEvents) {
    return rawEvents.map((event) => ({ ...event, eventDate: fromDateToString(event.eventDate) }))
  }

  function sortEvents(eventsList) {
    if (by) {
      let order = 0
      const orderDirection = direction === 'asc' ? 1 : -1
      const sortedEvents = [...eventsList].sort((a, b) => {
        switch (by) {
          case 'title':
            const nameA = a.title.toLowerCase()
            const nameB = b.title.toLowerCase()
            order = nameA.localeCompare(nameB)
            break
          case 'eventDate':
            order = new Date(a.eventDate) - new Date(b.eventDate)
            break
          default:
            order = 0
        }
        return order * orderDirection
      })
      return sortedEvents
    }

    return eventsList
  }

  // Fetch events data from the API
  useEffect(() => {
    if (initialData !== null) return
    setLoadingEvents(true)
    fetch(`/api/club-years/${clubYearLabel}/events`)
      .then((res) => res.json())
      .then((data) => {
        setRawEvents(data)
        let eventsList = transformEventsData(data)
        eventsList = sortEvents(eventsList)
        setEvents(eventsList)
        setLoadingEvents(false)
      })
  }, [clubYearLabel])

  // Re-sort events whenever sortBy or sortDirection change
  useEffect(() => {
    if (rawEvents.length === 0) return
    let eventsList = transformEventsData(rawEvents)
    eventsList = sortEvents(eventsList)
    setEvents(eventsList)
  }, [by, direction])

  return { events, loadingEvents }
}

export default useEvents
