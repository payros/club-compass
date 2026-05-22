import { useEffect, useState } from 'react'

function useChild(childId, clubYearLabel = null) {
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    const url = clubYearLabel ? `/api/club-years/${clubYearLabel}/children/${childId}` : `/api/children/${childId}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setChild({ ...data, parents: data.parents ?? [], awards: data.awards ?? [] })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [childId, clubYearLabel])

  return { child, loading }
}

export default useChild
