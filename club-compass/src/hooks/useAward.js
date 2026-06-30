import { useEffect, useState } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import { fromDateToString } from '@/utils/dateUtils'

function useAward(awardId, clubYearLabel = null) {
  const [award, setAward] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!awardId) {
      setAward(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const url = clubYearLabel ? `/api/club-years/${clubYearLabel}/awards/${awardId}` : `/api/awards/${awardId}`
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          setAward(null)
          setLoading(false)
          return
        }
        res.json().then((data) => {
          const type = data.type ? fromSnakeCaseToTitleCase(data.type) : null
          setAward({
            ...data,
            level: data.level ? fromSnakeCaseToTitleCase(data.level) : 'No level (multi-level award)',
            type: type ?? '—',
            link: data.link || null,
            linkLabel: data.link ? `${data.name ?? ''} ${type ?? ''} requirements`.trim() : '—',
            patchImageUrl: data.patchImageUrl || null,
            childrenAwarded: (data.childrenAwarded ?? []).map((c) => ({
              id: c.id,
              name: `${c.firstName} ${c.lastName}`,
              class: c.class ? fromSnakeCaseToTitleCase(c.class) : '',
              earnedOn: c.earnedOn ? fromDateToString(c.earnedOn) : '—',
              eventId: c.eventId,
            })),
          })
          setLoading(false)
        })
      })
      .catch(() => {
        setAward(null)
        setLoading(false)
      })
  }, [awardId, clubYearLabel])

  return { award, loading }
}

export default useAward
