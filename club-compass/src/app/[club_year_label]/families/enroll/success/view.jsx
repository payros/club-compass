'use client'
import { Box, Button, Heading, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import FormPage from '@/components/pages/FormPage'

const View = () => {
  const router = useRouter()
  const clubYearLabel = useParams()['club_year_label']
  const searchParams = useSearchParams()

  const [parents, setParents] = useState([])
  const [selectedParentId, setSelectedParentId] = useState('')
  const [loadingPdf, setLoadingPdf] = useState(false)

  useEffect(() => {
    const ids = (searchParams.get('parentIds') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (ids.length === 0) return

    Promise.all(ids.map((id) => fetch(`/api/parents/${id}`).then((r) => r.json()))).then((results) => {
      setParents(results)
      if (results.length === 1) {
        setSelectedParentId(String(results[0].id))
      }
    })
  }, [searchParams])

  function handlePrintForms() {
    if (!selectedParentId) return
    setLoadingPdf(true)
    window.open(`/api/club-years/${clubYearLabel}/families/registration-form?parentId=${selectedParentId}`, '_blank')
    setLoadingPdf(false)
  }

  const breadcrumbs = [
    { label: 'Enroll Family', href: `/${clubYearLabel}/families/enroll` },
    { label: 'Enrollment Complete' },
  ]

  return (
    <FormPage
      title="Enrollment Complete"
      description={`The family has been enrolled in the ${clubYearLabel} club year. Don't forget to print their registration forms if you haven't already.`}
      breadcrumbs={breadcrumbs}
      submitLabel="Done"
      handleSubmit={(e) => {
        e.preventDefault()
        router.push(`/${clubYearLabel}/dashboard`)
      }}
    >
      <Box w="full" my={2}>
        {parents.length > 1 && (
          <Box mb={4}>
            <Text fontWeight="medium" mb={1}>
              Select parent to sign
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)}>
                <option value="">Choose a parent…</option>
                {parents.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
        )}

        <Stack gap={3}>
          <Button variant="outline" disabled={!selectedParentId || loadingPdf} onClick={handlePrintForms}>
            Print Forms <FaExternalLinkAlt style={{ width: '12px', height: '12px' }} />
          </Button>
          <Button variant="outline" onClick={() => router.push(`/${clubYearLabel}/families/enroll`)}>
            Enroll Another Family
          </Button>
        </Stack>
      </Box>
    </FormPage>
  )
}

export default View
