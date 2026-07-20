import { useEffect, useState } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import { ADVENTURER_CLASSES } from '@/utils/consts'

function useClasses(clubYearLabel, initialData = null) {
  const [classes, setClasses] = useState(() => (initialData ? transform(initialData) : []))
  const [loading, setLoading] = useState(initialData === null)

  function transform(raw) {
    return raw.map((c) => ({
      id: c.id,
      slug: c.class ?? null,
      class: c.class ? fromSnakeCaseToTitleCase(c.class) : '—',
      instructor: `${c.instructorFirstName ?? ''} ${c.instructorLastName ?? ''}`.trim() || '—',
      imageUrl: ADVENTURER_CLASSES[c.class]?.url ?? null,
      enrolled: Number(c.enrolledCount) ?? 0,
      awards: Number(c.awardsCount) ?? 0,
    }))
  }

  useEffect(() => {
    if (!clubYearLabel || initialData !== null) return
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
