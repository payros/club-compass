import { useEffect, useState } from 'react'
import { fromDateToString } from '@/utils/dateUtils'

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
          setStaffMember({
            ...data,
            backgroundCheckExpiration: data.backgroundCheckExpiration
              ? fromDateToString(data.backgroundCheckExpiration)
              : null,
            createdAt: data.createdAt ? fromDateToString(data.createdAt) : null,
          })
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
