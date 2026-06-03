'use client'
import { Box, Field, Input, Text, Spinner } from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

/**
 * SearchBox — generic typeahead search component.
 *
 * Props:
 *   type           — 'staff' | 'parent' | 'child' | 'award' | 'event' | 'family'
 *   label          — field label text
 *   placeholder    — input placeholder text
 *   handleSelect   — called with the selected item object
 *   clubYearLabel  — optional; scopes the search to a specific club year
 *   value          — controlled display value for the input
 *   maxSuggestions — max number of suggestions to show (default: 10)
 */
const searchCache = {}

function getEndpoint(type, clubYearLabel) {
  const base = clubYearLabel ? `/api/club-years/${clubYearLabel}` : '/api'
  const resourceMap = {
    staff: 'staff',
    parent: 'parents',
    child: 'children',
    award: 'awards',
    event: 'events',
    family: 'families',
  }
  return `${base}/${resourceMap[type]}`
}

function SuggestionRow({ type, item, clubYearLabel }) {
  const name = type === 'event' ? item.title : `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || item.name

  let subtitle = null
  if (type === 'staff') {
    const role = item.staffRole ?? item.lastRole
    if (role) subtitle = fromSnakeCaseToTitleCase(role)
  } else if (type === 'child' && clubYearLabel) {
    const cls = item.class
    if (cls) subtitle = fromSnakeCaseToTitleCase(cls)
  } else if (type === 'event' && !clubYearLabel) {
    if (item.clubYearLabel) subtitle = item.clubYearLabel
  } else if (type === 'award') {
    if (item.level) subtitle = fromSnakeCaseToTitleCase(item.level)
  }

  return (
    <>
      <Text fontWeight="medium">{name}</Text>
      {subtitle && (
        <Text fontSize="xs" fontStyle="italic" color="fg.muted">
          {subtitle}
        </Text>
      )}
    </>
  )
}

const SearchBox = ({
  type,
  label,
  placeholder,
  handleSelect,
  clubYearLabel,
  value,
  style,
  maxSuggestions = 10,
  extraQueryParams = null,
}) => {
  const [query, setQuery] = useState(value ?? '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  async function fetchResults(q) {
    const normalizedQ = q.trim().toLowerCase()
    const extraKey = extraQueryParams ? JSON.stringify(extraQueryParams) : ''
    const cacheKey = `${type}:${clubYearLabel ?? ''}:${normalizedQ}:${extraKey}`
    if (searchCache[cacheKey] !== undefined) {
      setResults(searchCache[cacheKey])
      setLoading(false)
      return
    }
    const endpoint = getEndpoint(type, clubYearLabel)
    const params = new URLSearchParams()
    if (normalizedQ) params.set('search', normalizedQ)
    if (extraQueryParams) {
      Object.entries(extraQueryParams).forEach(([k, v]) => params.set(k, String(v)))
    }
    const qs = params.toString()
    const url = qs ? `${endpoint}?${qs}` : endpoint
    try {
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        searchCache[cacheKey] = data
        setResults(data)
      } else {
        setResults([])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleFocus() {
    if (results.length === 0) {
      setLoading(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => fetchResults(query), 300)
    }
  }

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(timerRef.current)

    setLoading(true)
    timerRef.current = setTimeout(() => fetchResults(q), 300)
  }

  function onSelect(item) {
    const displayName =
      type === 'event' ? item.title : `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || item.name
    setResults([])
    const result = handleSelect(item)
    if (result === false) {
      setQuery('')
    } else {
      setQuery(displayName)
    }
  }

  return (
    <Box position="relative" style={style}>
      <Field.Root>
        {label && <Field.Label>{label}</Field.Label>}
        <Input
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => {
            clearTimeout(timerRef.current)
            setLoading(false)
            setTimeout(() => setResults([]), 150)
          }}
          autoComplete="off"
        />
      </Field.Root>
      {(loading || results.length > 0) && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={10}
          mt={1}
          borderWidth={1}
          borderRadius="md"
          boxShadow="lg"
          bg="bg.panel"
          overflow="hidden"
        >
          {loading ? (
            <Box px={3} py={3} display="flex" justifyContent="center">
              <Spinner size="sm" colorPalette="accent" />
            </Box>
          ) : (
            results.slice(0, maxSuggestions).map((item) => (
              <Box
                key={item.id}
                px={3}
                py={2}
                cursor="pointer"
                _hover={{ bg: 'bg.subtle' }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(item)
                }}
              >
                <SuggestionRow type={type} item={item} clubYearLabel={clubYearLabel} />
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  )
}

export default SearchBox
