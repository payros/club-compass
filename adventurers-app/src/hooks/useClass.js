import { useEffect, useState } from 'react'
import { ADVENTURER_CLASSES } from '@/utils/consts'

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
                imageUrl: ADVENTURER_CLASSES[data.class]?.url ?? null,
                imagePadding: ADVENTURER_CLASSES[data.class]?.padding ?? 10,
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
