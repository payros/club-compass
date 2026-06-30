import { useEffect, useState } from 'react'

function useEvent(clubYearLabel, eventId) {
  const [event, setEvent] = useState(null)
  const [loadingEvent, setLoadingEvent] = useState(true)

  useEffect(() => {
    if (!clubYearLabel || !eventId) return

    setLoadingEvent(true)
    fetch(`/api/club-years/${clubYearLabel}/events/${eventId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setEvent(data)
        } else {
          setEvent(null)
        }
        setLoadingEvent(false)
      })
      .catch(() => {
        setEvent(null)
        setLoadingEvent(false)
      })
  }, [clubYearLabel, eventId])

  return { event, loadingEvent }
}

export default useEvent
