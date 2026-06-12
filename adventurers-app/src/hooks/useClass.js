import { useEffect, useState } from 'react'
import { CLASS_LOGO_MAP } from '@/utils/consts'

function useClass(clubYearLabel, className) {
  const [cls, setCls] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clubYearLabel || !className) return

    setLoading(true)
    fetch(`/api/club-years/${clubYearLabel}/classes/${className}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCls(
          data
            ? {
                ...data,
                imageUrl: CLASS_LOGO_MAP[data.class]?.url ?? null,
                imagePadding: CLASS_LOGO_MAP[data.class]?.padding ?? 10,
              }
            : null
        )
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
