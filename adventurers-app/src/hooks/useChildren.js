import { useEffect, useState } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import { fromDateOfBirthToAge } from '@/utils/dateUtils'

function useChildren(clubYearLabel = null, { by, direction } = {}) {
  const [rawChildren, setRawChildren] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  function transform(raw) {
    return raw.map((c) => {
      const firstName = c.firstName ?? c.first_name
      const lastName = c.lastName ?? c.last_name
      const dob = c.dateOfBirth ?? c.date_of_birth
      const base = {
        id: c.id,
        name: `${firstName} ${lastName}`,
        age: dob ? fromDateOfBirthToAge(dob) : '—',
      }
      if (clubYearLabel) {
        base.class = fromSnakeCaseToTitleCase(c.class)
      } else {
        base.sex = c.sex ?? '—'
        base.allergies = c.allergies ?? '—'
      }
      return base
    })
  }

  function sortChildren(childrenList) {
    if (!by) return childrenList
    const orderDirection = direction === 'asc' ? 1 : -1
    return [...childrenList].sort((a, b) => {
      switch (by) {
        case 'name':
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase()) * orderDirection
        case 'age':
          return (a.age - b.age) * orderDirection
        case 'class':
          return a.class.toLowerCase().localeCompare(b.class.toLowerCase()) * orderDirection
        default:
          return 0
      }
    })
  }

  useEffect(() => {
    setLoading(true)
    const url = clubYearLabel ? `/api/club-years/${clubYearLabel}/children` : '/api/children'
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setRawChildren(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [clubYearLabel])

  useEffect(() => {
    let childrenList = transform(rawChildren)
    childrenList = sortChildren(childrenList)
    setChildren(childrenList)
  }, [by, direction, rawChildren])

  return { children, loading }
}

export default useChildren
