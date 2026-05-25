'use client'
import { Button, Field, Input, Card, NativeSelect, IconButton, Stack, HStack, Box, Text } from '@chakra-ui/react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { FaRegTrashAlt } from 'react-icons/fa'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import FormPage from '@/components/pages/FormPage'
import { useFlow } from '@/hooks/useFlow'
import SearchBox from '@/components/SearchBox'
import { STAFF_ROLES } from '@/utils/consts'

const emptyStaffEntry = () => ({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  background_check_expiration: '',
  staff_role: '',
})

const View = () => {
  const router = useRouter()
  const clubYearLabel = useParams()['club_year_label']
  const { getNextPath, current, total } = useFlow()
  const [staffEntries, setStaffEntries] = useState([emptyStaffEntry()])
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)
  const [highlightedIndex, setHighlightedIndex] = useState(null)
  const cardRefs = useRef([])

  function handleSelectStaff(staff) {
    const existingIndex = staffEntries.findIndex((entry) => entry.id === staff.id)
    if (existingIndex !== -1) {
      setTimeout(() => {
        const card = cardRefs.current[existingIndex]
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          setHighlightedIndex(existingIndex)
          setTimeout(() => setHighlightedIndex(null), 3000)
        }
      }, 50)
      return
    }
    const isPristine = (entry) => !entry.first_name && !entry.last_name
    const newEntry = {
      id: staff.id,
      first_name: staff.firstName,
      last_name: staff.lastName,
      email: staff.email || '',
      phone: staff.phone || '',
      background_check_expiration: staff.backgroundCheckExpiration
        ? new Date(staff.backgroundCheckExpiration).toISOString().split('T')[0]
        : '',
      staff_role: staff.lastRole || '',
    }
    const targetIndex = isPristine(staffEntries[0]) ? 0 : staffEntries.length
    if (isPristine(staffEntries[0])) {
      setStaffEntries((prev) => {
        const updated = [...prev]
        updated[0] = newEntry
        return updated
      })
    } else {
      setStaffEntries((prev) => [...prev, newEntry])
    }
    setTimeout(() => {
      const card = cardRefs.current[targetIndex]
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        setHighlightedIndex(targetIndex)
        setTimeout(() => setHighlightedIndex(null), 3000)
      }
    }, 50)

    return false
  }

  function handleChange(index, field, value) {
    setStaffEntries((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function addEntry() {
    setStaffEntries((prev) => [...prev, emptyStaffEntry()])
  }

  function removeEntry(index) {
    setStaffEntries((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setGlobalError(null)
    setLoading(true)

    try {
      const response = await fetch(`/api/club-years/${clubYearLabel}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffEntries),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message = result?.error ?? 'Staff could not be enrolled. Please try again.'
        console.error('Enroll staff POST failed:', message)
        setGlobalError(message)
        setLoading(false)
        return
      }

      router.push(getNextPath?.({ club_year_label: clubYearLabel }) ?? `/${clubYearLabel}/dashboard`)
    } catch (error) {
      console.error('Enroll staff submission error:', error)
      setGlobalError('Staff could not be enrolled. Please try again.')
      setLoading(false)
    }
  }

  const breadcrumbs = [{ label: clubYearLabel, href: `/${clubYearLabel}/dashboard` }, { label: 'Enroll Staff' }]

  return (
    <FormPage
      title="Enroll Staff"
      description={`Add one or more staff members to the ${clubYearLabel} club year.`}
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Enroll Staff"
      submitLoadingLabel="Enrolling Staff…"
      loading={loading}
      maxWidth={600}
      current={current}
      total={total}
    >
      {/* Typeahead: enroll existing staff */}
      {!getNextPath && (
        <Box mb={4}>
          <SearchBox
            type="staff"
            label="Enroll Existing Staff"
            placeholder="Search by first or last name"
            handleSelect={handleSelectStaff}
          />
        </Box>
      )}

      {staffEntries.map((entry, index) => (
        <Card.Root
          key={index}
          ref={(el) => (cardRefs.current[index] = el)}
          mb={2}
          bg="transparent"
          borderWidth={0}
          boxShadow="none"
          style={{
            boxShadow: highlightedIndex === index ? '0 0 0 2px #38A169' : undefined,
            transition: 'box-shadow 0.3s',
            borderRadius: '8px',
          }}
        >
          <Card.Body px="0.5rem" py="1rem">
            <HStack justify="space-between" mb={3}>
              <span style={{ fontWeight: 400 }}>Staff Member {index + 1}</span>
              {staffEntries.length > 1 && (
                <IconButton
                  variant="ghost"
                  aria-label="Remove staff member"
                  size="sm"
                  type="button"
                  onClick={() => removeEntry(index)}
                >
                  <FaRegTrashAlt />
                </IconButton>
              )}
            </HStack>
            <Stack gap={3}>
              <HStack gap={3}>
                <Field.Root flex={1} required>
                  <Field.Label>First Name</Field.Label>
                  <Input
                    placeholder="First name"
                    value={entry.first_name}
                    onChange={(e) => handleChange(index, 'first_name', e.target.value)}
                  />
                </Field.Root>
                <Field.Root flex={1} required>
                  <Field.Label>Last Name</Field.Label>
                  <Input
                    placeholder="Last name"
                    value={entry.last_name}
                    onChange={(e) => handleChange(index, 'last_name', e.target.value)}
                  />
                </Field.Root>
              </HStack>
              <HStack gap={3}>
                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={entry.email}
                    onChange={(e) => handleChange(index, 'email', e.target.value)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Phone</Field.Label>
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={entry.phone}
                    onChange={(e) => handleChange(index, 'phone', e.target.value)}
                  />
                </Field.Root>
              </HStack>
              <HStack gap={3}>
                <Field.Root>
                  <Field.Label>Background Check Expiration</Field.Label>
                  <Input
                    type="date"
                    value={entry.background_check_expiration}
                    onChange={(e) => handleChange(index, 'background_check_expiration', e.target.value)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Role</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={entry.staff_role}
                      onChange={(e) => handleChange(index, 'staff_role', e.target.value)}
                    >
                      <option value="">Select a role</option>
                      {STAFF_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {fromSnakeCaseToTitleCase(role)}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
              </HStack>
            </Stack>
          </Card.Body>
        </Card.Root>
      ))}
      <Button disabled={loading} size="sm" variant="outline" colorPalette="brand" type="button" onClick={addEntry}>
        Add Another Staff Member
      </Button>
    </FormPage>
  )
}

export default View
