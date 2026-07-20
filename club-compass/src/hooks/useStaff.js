import { useEffect, useState } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

function useStaff(clubYearLabel = null, initialData = null) {
  const [rawStaff, setRawStaff] = useState(initialData ?? [])
  const [staff, setStaff] = useState(() => (initialData ? transform(initialData) : []))
  const [loading, setLoading] = useState(initialData === null)

  function transform(raw) {
    return raw.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email ?? '—',
      phone: s.phone ?? '—',
      role: s.staffRole ? fromSnakeCaseToTitleCase(s.staffRole) : '—',
      class: s.instructorClass ? fromSnakeCaseToTitleCase(s.instructorClass) : '—',
      backgroundCheckExpiration: s.backgroundCheckExpiration
        ? new Date(s.backgroundCheckExpiration).toLocaleDateString()
        : s.background_check_expiration
          ? new Date(s.background_check_expiration).toLocaleDateString()
          : '—',
    }))
  }

  useEffect(() => {
    if (initialData !== null) return
    setLoading(true)
    const url = clubYearLabel ? `/api/club-years/${clubYearLabel}/staff` : '/api/staff'
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setRawStaff(data)
        setStaff(transform(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [clubYearLabel])

  return { staff, loading }
}

export default useStaff
