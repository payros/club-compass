import { useEffect, useState } from "react"

function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  function transform(raw) {
    return raw.map(u => ({
      id: u.id,
      name: `${u.firstName ?? u.first_name ?? ''} ${u.lastName ?? u.last_name ?? ''}`.trim() || '—',
      email: u.email ?? '—',
      createdAt: u.createdAt ?? u.created_at
        ? new Date(u.createdAt ?? u.created_at).toLocaleDateString()
        : '—',
    }))
  }

  useEffect(() => {
    setLoading(true)
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(transform(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { users, loading }
}

export default useUsers
