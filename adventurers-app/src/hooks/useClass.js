import { useEffect, useState } from 'react'

function useClass(clubYearLabel, className) {
  const [cls, setCls] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clubYearLabel || !className) return

    setLoading(true)
    fetch(`/api/club-years/${clubYearLabel}/classes/${className}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCls(data)
        setLoading(false)
      })
      .catch(() => {
        setCls(null)
        setLoading(false)
      })
  }, [clubYearLabel, className])

  return { cls, loading }
}

export default useClass
