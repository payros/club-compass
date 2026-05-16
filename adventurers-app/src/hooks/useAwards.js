import { useEffect, useState } from "react"
import { fromSnakeCaseToTitleCase } from "@/utils/stringUtils"

function useAwards() {
  const [awards, setAwards] = useState([])
  const [loading, setLoading] = useState(true)

  function transform(raw) {
    return raw.map(a => ({
      id: a.id,
      name: a.name ?? '—',
      type: a.type ? fromSnakeCaseToTitleCase(a.type) : '—',
      level: a.level ? fromSnakeCaseToTitleCase(a.level) : '—',
    }))
  }

  useEffect(() => {
    setLoading(true)
    fetch('/api/awards')
      .then(res => res.json())
      .then(data => {
        setAwards(transform(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { awards, loading }
}

export default useAwards
