import { useEffect, useState } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import { fromDateOfBirthToAge } from '@/utils/dateUtils'

function transform(raw, clubYearLabel) {
  return raw.map((c) => {
    const base = {
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      age: c.dateOfBirth ? fromDateOfBirthToAge(c.dateOfBirth) : '—',
    }
    if (clubYearLabel) {
      base.class = fromSnakeCaseToTitleCase(c.class)
      base.sex = c.sex === 'male' ? 'M' : c.sex === 'female' ? 'F' : '—'
      base.allergies = c.allergies ?? '—'
      base.medicalConditions = c.medicalConditions ?? '—'
      base.parents = c.parents ?? '—'
      base.attendance = c.attendance != null ? `${c.attendance}%` : '—'
      base.awardsEarned = c.awardsEarned ?? 0
    } else {
      base.sex = c.sex ?? '—'
      base.allergies = c.allergies ?? '—'
    }
    return base
  })
}

function sortChildren(childrenList, by, direction) {
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

function useChildren(clubYearLabel = null, { by, direction } = {}) {
  const [rawChildren, setRawChildren] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = clubYearLabel ? `/api/club-years/${clubYearLabel}/children` : '/api/children'
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setRawChildren(data)
        let childrenList = transform(data, clubYearLabel)
        childrenList = sortChildren(childrenList, by, direction)
        setChildren(childrenList)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [clubYearLabel])

  // Re-sort children whenever sortBy or sortDirection change
  useEffect(() => {
    if (rawChildren.length === 0) return
    let childrenList = transform(rawChildren, clubYearLabel)
    childrenList = sortChildren(childrenList, by, direction)
    setChildren(childrenList)
  }, [by, direction])

  return { children, loading }
}

export default useChildren
