import { useEffect, useState } from "react"
import { fromSnakeCaseToTitleCase } from "@/utils/stringUtils"

function useClasses(clubYearLabel) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  function transform(raw) {
    return raw.map(c => ({
      id: c.id,
      class: c.class ? fromSnakeCaseToTitleCase(c.class) : '—',
      instructor: `${c.instructorFirstName ?? c.instructor_first_name ?? ''} ${c.instructorLastName ?? c.instructor_last_name ?? ''}`.trim() || '—',
    }))
  }

  useEffect(() => {
    if (!clubYearLabel) return
    setLoading(true)
    fetch(`/api/club-years/${clubYearLabel}/class`)
      .then(res => res.json())
      .then(data => {
        setClasses(transform(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [clubYearLabel])

  return { classes, loading }
}

export default useClasses
