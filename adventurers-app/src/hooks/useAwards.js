import { useEffect, useState } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

function useAwards(clubYearLabel = null) {
  const [awards, setAwards] = useState([])
  const [loading, setLoading] = useState(true)

  function transform(raw) {
    return raw.map((a) => {
      const type = a.type ? fromSnakeCaseToTitleCase(a.type) : null
      return {
        id: a.id,
        name: a.name ?? '—',
        type: type ?? '—',
        level: a.level ? fromSnakeCaseToTitleCase(a.level) : '—',
        class: a.level ? fromSnakeCaseToTitleCase(a.level) : '—',
        link: a.link || null,
        linkLabel: a.link ? `${a.name ?? ''} ${type ?? ''} requirements`.trim() : '—',
        patchImageUrl: a.patchImageUrl || null,
      }
    })
  }

  useEffect(() => {
    setLoading(true)
    const url = clubYearLabel ? `/api/club-years/${clubYearLabel}/awards` : '/api/awards'
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAwards(transform(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [clubYearLabel])

  return { awards, loading }
}

export default useAwards
