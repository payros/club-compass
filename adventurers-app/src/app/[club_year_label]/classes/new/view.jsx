'use client'
import { Box, Field, Stack } from '@chakra-ui/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import FormPage from '@/components/pages/FormPage'
import SearchBox from '@/components/SearchBox'
import { ADVENTURER_CLASSES } from '@/utils/consts'
import { useFlow } from '@/hooks/useFlow'

const emptyClassState = () => ({
  instructor: null,
})

const View = () => {
  const router = useRouter()
  const clubYearLabel = useParams()['club_year_label']
  const [assignments, setAssignments] = useState(
    Object.fromEntries(ADVENTURER_CLASSES.map((c) => [c, emptyClassState()]))
  )
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)
  const [prefilling, setPrefilling] = useState(true)
  const [isUpdate, setIsUpdate] = useState(false)
  const { getNextPath, current, total } = useFlow()

  useEffect(() => {
    fetch(`/api/club-years/${clubYearLabel}/classes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setIsUpdate(true)
          setAssignments((prev) => {
            const next = { ...prev }
            data.forEach((cls) => {
              if (next[cls.class] !== undefined) {
                next[cls.class] = {
                  instructor: {
                    id: cls.instructorId,
                    firstName: cls.instructorFirstName,
                    lastName: cls.instructorLastName,
                  },
                }
              }
            })
            return next
          })
        }
      })
      .catch(() => {})
      .finally(() => setPrefilling(false))
  }, [clubYearLabel])

  const allAssigned = ADVENTURER_CLASSES.every((c) => assignments[c].instructor !== null)

  function updateClass(className, updates) {
    setAssignments((prev) => ({
      ...prev,
      [className]: { ...prev[className], ...updates },
    }))
  }

  function handleSelect(className, staff) {
    updateClass(className, {
      instructor: {
        id: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        staffRole: staff.staffRole,
      },
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGlobalError(null)
    setLoading(true)

    const classes = ADVENTURER_CLASSES.map((c) => ({
      class: c,
      instructor_id: assignments[c].instructor.id,
    }))

    try {
      const res = await fetch(`/api/club-years/${clubYearLabel}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classes),
      })

      if (!res.ok) {
        const result = await res.json().catch(() => null)
        setGlobalError(result?.error ?? 'Could not add classes. Please try again.')
        setLoading(false)
        return
      }

      router.push(getNextPath ? getNextPath() : `/${clubYearLabel}/classes`)
    } catch {
      setGlobalError('Could not add classes. Please try again.')
      setLoading(false)
    }
  }

  const breadcrumbs = [{ label: 'Classes', href: `/${clubYearLabel}/classes` }, { label: 'Add Classes' }]

  const title = isUpdate ? 'Update Classes' : 'Add Classes'
  const description = isUpdate
    ? `Update the instructor for each class for the ${clubYearLabel} club year.`
    : `Assign an instructor to each class for the ${clubYearLabel} club year.`
  const submitLabel = isUpdate ? 'Update Classes' : 'Add Classes'
  const submitLoadingLabel = isUpdate ? 'Updating Classes…' : 'Adding Classes…'

  return (
    <FormPage
      title={title}
      description={description}
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel={submitLabel}
      submitLoadingLabel={submitLoadingLabel}
      loading={loading}
      submitDisabled={!allAssigned}
      contentLoading={prefilling}
      current={current}
      total={total}
      maxWidth={600}
    >
      <Stack gap={5} mb="2rem">
        {ADVENTURER_CLASSES.map((className) => {
          const instructor = assignments[className].instructor
          const prefillValue = instructor ? `${instructor.firstName} ${instructor.lastName}`.trim() : ''
          return (
            <Field.Root key={className}>
              <Box display="flex" gap={3} width="100%" alignItems="flex-start">
                <Box flex={0.5}>
                  <SearchBox
                    type="staff"
                    label={`${fromSnakeCaseToTitleCase(className)} Instructor`}
                    placeholder="Search instructor by name…"
                    clubYearLabel={clubYearLabel}
                    handleSelect={(staff) => handleSelect(className, staff)}
                    value={prefillValue}
                  />
                </Box>
              </Box>
            </Field.Root>
          )
        })}
      </Stack>
    </FormPage>
  )
}

export default View
