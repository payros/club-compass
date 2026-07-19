import { useEffect, useState } from 'react'
import { transformAward } from '@/utils/transformUtils'

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
          setAward(transformAward(data))
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
