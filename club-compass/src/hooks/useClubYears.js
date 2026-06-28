import { useEffect, useState } from "react"

function useClubYears() {
  const [clubYears, setClubYears] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/club-years')
      .then(res => res.json())
      .then(data => {
        setClubYears(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { clubYears, loading }
}

export default useClubYears
