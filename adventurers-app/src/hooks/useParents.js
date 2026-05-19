import { useEffect, useState } from "react"

function useParents() {
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)

  function transform(raw) {
    return raw.map(p => ({
      id: p.id,
      name: `${p.firstName ?? p.first_name} ${p.lastName ?? p.last_name}`,
      email: p.email ?? '—',
      phone: p.phone ?? '—',
      address: p.address ?? '—',
    }))
  }

  useEffect(() => {
    setLoading(true)
    fetch('/api/parents')
      .then(res => res.json())
      .then(data => {
        setParents(transform(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { parents, loading }
}

export default useParents
