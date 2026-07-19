'use client'
import { Button, Checkbox, Field, Input, Card, IconButton, Stack, HStack, Box } from '@chakra-ui/react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { FaRegTrashAlt } from 'react-icons/fa'
import FormPage from '@/components/pages/FormPage'
import AdventurerForm from '@/components/forms/AdventurerForm'
import SearchBox from '@/components/SearchBox'
import useClasses from '@/hooks/useClasses'
import { localDateToISO } from '@/utils/dateUtils'

const emptyParentEntry = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  isEmergencyContact: false,
})

const emptyChildEntry = () => ({
  firstName: '',
  lastName: '',
  allergies: '',
  medicalConditions: '',
  physicalRestrictions: '',
  sex: '',
  dateOfBirth: '',
  classId: '',
  grade: '',
})

const normalizeDateOfBirth = (value) => {
  if (!value) return ''
  return value.includes('T') ? value.split('T')[0] : value
}

const View = () => {
  const router = useRouter()
  const clubYearLabel = useParams()['club_year_label']
  const [parentEntries, setParentEntries] = useState([emptyParentEntry()])
  const [childEntries, setChildEntries] = useState([emptyChildEntry()])
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)
  const [sameAddress, setSameAddress] = useState(false)
  const [highlightedParentIndices, setHighlightedParentIndices] = useState(new Set())
  const [highlightedChildIndices, setHighlightedChildIndices] = useState(new Set())
  const cardRefs = useRef([])
  const { classes, loading: classesLoading } = useClasses(clubYearLabel)

  async function handleSelectFamilyMember(familyMember) {
    try {
      // Use family member to call the api and get all family members by id and type of a member
      const familyData = await fetch(
        `/api/club-years/${clubYearLabel}/families?id=${familyMember.id}&type=${familyMember.type}`
      )
      const { children, parents } = await familyData.json()
      // Then populate the parentEntries and childEntries with the results.
      // This will allow the user to see all family members and edit their information if needed before submitting.
      setChildEntries(() => {
        return children.map((child) => ({
          ...emptyChildEntry(),
          ...child,
          dateOfBirth: normalizeDateOfBirth(child.dateOfBirth),
        }))
      })
      setParentEntries(() => {
        return parents.map((parent) => ({ ...emptyParentEntry(), ...parent }))
      })
      const addresses = parents.map((p) => p.address ?? '')
      setSameAddress(parents.length > 1 && addresses.every((a) => a === addresses[0]))
      setHighlightedParentIndices(new Set(parents.map((_, i) => i)))
      setHighlightedChildIndices(new Set(children.map((_, i) => i)))
      setTimeout(() => {
        setHighlightedParentIndices(new Set())
        setHighlightedChildIndices(new Set())
      }, 3000)
    } catch (error) {
      setGlobalError('Could not load adventurer data. Please try again.')
      setContentLoading(false)
    }

    return false
  }

  function handleChange(index, field, value, type) {
    if (type == 'child') {
      setChildEntries((prev) => {
        const updated = [...prev]
        updated[index] = { ...updated[index], [field]: value }
        return updated
      })
    } else {
      setParentEntries((prev) => {
        const updated = [...prev]
        if (field === 'address' && sameAddress) {
          return updated.map((entry) => ({ ...entry, address: value }))
        }
        updated[index] = { ...updated[index], [field]: value }
        return updated
      })
    }
  }

  function addEntry(type = 'parent') {
    if (type === 'child') {
      setChildEntries((prev) => [...prev, emptyChildEntry()])
    } else {
      setParentEntries((prev) => [...prev, emptyParentEntry()])
    }
  }

  function removeEntry(index, type = 'parent') {
    if (type === 'child') {
      setChildEntries((prev) => prev.filter((_, i) => i !== index))
    } else {
      setParentEntries((prev) => prev.filter((_, i) => i !== index))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setGlobalError(null)

    const isParentValid = (p) => p.firstName.trim() && p.lastName.trim()
    const isChildValid = (c) => c.firstName.trim() && c.lastName.trim() && c.classId
    if (!parentEntries.every(isParentValid) || !childEntries.every(isChildValid)) {
      setGlobalError('Please fill out all required fields.')
      return
    }
    if (!parentEntries.some((p) => p.isEmergencyContact)) {
      setGlobalError('At least one parent must be marked as an emergency contact.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/club-years/${clubYearLabel}/families`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parents: parentEntries,
          children: childEntries.map((c) => ({ ...c, dateOfBirth: localDateToISO(c.dateOfBirth) })),
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        const message = result?.error ?? 'Family could not be enrolled. Please try again.'
        console.error('Enroll family POST failed:', message)
        setGlobalError(message)
        setLoading(false)
        return
      }

      const result = await response.json()
      const parentIds = result.parents.map((p) => p.id).join(',')
      router.push(`/${clubYearLabel}/families/enroll/success?parentIds=${parentIds}`)
    } catch (error) {
      console.error('Enroll family submission error:', error)
      setGlobalError('Family could not be enrolled. Please try again.')
      setLoading(false)
    }
  }

  const breadcrumbs = [{ label: 'Enroll Family' }]

  return (
    <FormPage
      title="Enroll Family"
      description={`Fill in the information below to enroll a family in the the ${clubYearLabel} club year.`}
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Enroll Family"
      submitLoadingLabel="Enrolling Family…"
      loading={loading}
      contentLoading={classesLoading}
      maxWidth={600}
    >
      {/* Typeahead: enroll existing family */}
      <Box mb={4}>
        <SearchBox
          type="family"
          label="Find existing family"
          placeholder="Search by parent or child first or last name"
          handleSelect={handleSelectFamilyMember}
        />
      </Box>

      {parentEntries.map((entry, index) => (
        <Card.Root
          key={index}
          ref={(el) => (cardRefs.current[index] = el)}
          mb={2}
          bg="transparent"
          borderWidth={0}
          boxShadow="none"
          style={{
            boxShadow: highlightedParentIndices.has(index) ? '0 0 0 2px #38A169' : undefined,
            transition: 'box-shadow 0.3s',
            borderRadius: '8px',
          }}
        >
          <Card.Body px="0.5rem" py="1rem">
            <HStack justify="space-between" mb={3}>
              <span style={{ fontWeight: 400 }}>Parent {index + 1}</span>
              {parentEntries.length > 1 && (
                <IconButton
                  variant="ghost"
                  aria-label="Remove parent"
                  size="sm"
                  type="button"
                  onClick={() => removeEntry(index, 'parent')}
                >
                  <FaRegTrashAlt />
                </IconButton>
              )}
            </HStack>
            <Stack gap={3}>
              <HStack gap={3}>
                <Field.Root flex={1} required>
                  <Field.Label>
                    First Name <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    placeholder="First name"
                    value={entry.firstName}
                    onChange={(e) => handleChange(index, 'firstName', e.target.value)}
                  />
                </Field.Root>
                <Field.Root flex={1} required>
                  <Field.Label>
                    Last Name <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    placeholder="Last name"
                    value={entry.lastName}
                    onChange={(e) => handleChange(index, 'lastName', e.target.value)}
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
                  <Field.Label>Address</Field.Label>
                  <Input
                    type="address"
                    placeholder="Address"
                    value={entry.address}
                    onChange={(e) => handleChange(index, 'address', e.target.value)}
                  />
                </Field.Root>
              </HStack>
              <HStack gap={3} wrap="wrap">
                <Checkbox.Root
                  checked={entry.isEmergencyContact}
                  onCheckedChange={(e) => handleChange(index, 'isEmergencyContact', !!e.checked, 'parent')}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>Emergency Contact</Checkbox.Label>
                </Checkbox.Root>
                {index === 0 && (
                  <Checkbox.Root
                    checked={sameAddress}
                    onCheckedChange={(e) => {
                      const checked = !!e.checked
                      setSameAddress(checked)
                      if (checked) {
                        const sharedAddress = parentEntries[0].address
                        setParentEntries((prev) => prev.map((p) => ({ ...p, address: sharedAddress })))
                      }
                    }}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>Same address for all parents</Checkbox.Label>
                  </Checkbox.Root>
                )}
              </HStack>
            </Stack>
          </Card.Body>
        </Card.Root>
      ))}
      <Button
        disabled={loading}
        size="sm"
        variant="outline"
        colorPalette="brand"
        type="button"
        onClick={() => addEntry('parent')}
      >
        Add Another Parent
      </Button>

      {childEntries.map((entry, index) => (
        <Card.Root
          key={index}
          ref={(el) => (cardRefs.current[index] = el)}
          mb={2}
          bg="transparent"
          borderWidth={0}
          boxShadow="none"
          style={{
            boxShadow: highlightedChildIndices.has(index) ? '0 0 0 2px #38A169' : undefined,
            transition: 'box-shadow 0.3s',
            borderRadius: '8px',
          }}
        >
          <Card.Body px="0.5rem" py="1rem">
            <HStack justify="space-between" mb={3}>
              <span style={{ fontWeight: 400 }}>Child {index + 1}</span>
              {childEntries.length > 1 && (
                <IconButton
                  variant="ghost"
                  aria-label="Remove child"
                  size="sm"
                  type="button"
                  onClick={() => removeEntry(index, 'child')}
                >
                  <FaRegTrashAlt />
                </IconButton>
              )}
            </HStack>
            <AdventurerForm
              entry={entry}
              onChange={(field, value) => handleChange(index, field, value, 'child')}
              classes={classes}
            />
          </Card.Body>
        </Card.Root>
      ))}
      <Button
        disabled={loading}
        size="sm"
        variant="outline"
        colorPalette="brand"
        type="button"
        onClick={() => addEntry('child')}
      >
        Add Another child
      </Button>
    </FormPage>
  )
}

export default View
