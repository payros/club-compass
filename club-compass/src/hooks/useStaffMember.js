import { useEffect, useState } from 'react'
import { transformStaffMember } from '@/utils/transformUtils'

function useStaffMember(staffId, clubYearLabel = null) {
  const [staffMember, setStaffMember] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!staffId) {
      setStaffMember(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const url = clubYearLabel ? `/api/club-years/${clubYearLabel}/staff/${staffId}` : `/api/staff/${staffId}`
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          setStaffMember(null)
          setLoading(false)
          return
        }
        res.json().then((data) => {
          setStaffMember(transformStaffMember(data))
          setLoading(false)
        })
      })
      .catch(() => {
        setStaffMember(null)
        setLoading(false)
      })
  }, [staffId, clubYearLabel])

  return { staffMember, loading }
}

export default useStaffMember
