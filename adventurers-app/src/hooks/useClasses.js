import { useEffect, useState } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

function useClasses(clubYearLabel) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  function transform(raw) {
    return raw.map((c) => ({
      id: c.id,
      slug: c.class ?? null,
      class: c.class ? fromSnakeCaseToTitleCase(c.class) : '—',
      instructor: `${c.instructorFirstName ?? ''} ${c.instructorLastName ?? ''}`.trim() || '—',
    }))
  }

  useEffect(() => {
    if (!clubYearLabel) return
    setLoading(true)
    fetch(`/api/club-years/${clubYearLabel}/classes`)
      .then((res) => res.json())
      .then((data) => {
        setClasses(transform(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [clubYearLabel])

  return { classes, loading }
}

export default useClasses
