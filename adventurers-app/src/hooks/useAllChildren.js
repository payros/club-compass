import { useEffect, useState } from "react"
import { fromDateOfBirthToAge } from "@/utils/dateUtils"

function useAllChildren() {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  function transform(raw) {
    return raw.map(c => ({
      id: c.id,
      name: `${c.firstName ?? c.first_name} ${c.lastName ?? c.last_name}`,
      age: c.dateOfBirth ?? c.date_of_birth ? fromDateOfBirthToAge(c.dateOfBirth ?? c.date_of_birth) : '—',
      sex: c.sex ?? '—',
      allergies: c.allergies ?? '—',
    }))
  }

  useEffect(() => {
    setLoading(true)
    fetch('/api/children')
      .then(res => res.json())
      .then(data => {
        setChildren(transform(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { children, loading }
}

export default useAllChildren
