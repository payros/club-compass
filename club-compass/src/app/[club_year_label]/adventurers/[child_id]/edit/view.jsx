'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import AdventurerForm from '@/components/forms/AdventurerForm'
import useClasses from '@/hooks/useClasses'

export default function View() {
  const { club_year_label: clubYearLabel, child_id: childId } = useParams()
  const router = useRouter()
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(true)
  const [globalError, setGlobalError] = useState(null)
  const { classes, loading: classesLoading } = useClasses(clubYearLabel)

  useEffect(() => {
    fetch(`/api/club-years/${clubYearLabel}/children/${childId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        setChild(data)
        setContentLoading(false)
      })
      .catch(() => {
        setGlobalError('Could not load adventurer data. Please try again.')
        setContentLoading(false)
      })
  }, [clubYearLabel, childId])

  async function handleSubmit(event) {
    event.preventDefault()
    setGlobalError(null)
    setLoading(true)

    const formData = new FormData(event.target)
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      dateOfBirth: formData.get('dateOfBirth') || null,
      sex: formData.get('sex') || null,
      allergies: formData.get('allergies') || null,
      medicalConditions: formData.get('medicalConditions') || null,
      classId: formData.get('classId') || null,
    }

    try {
      const response = await fetch(`/api/club-years/${clubYearLabel}/children/${childId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        setGlobalError(result?.error ?? 'The adventurer could not be updated. Please try again.')
        setLoading(false)
        return
      }
    } catch (err) {
      console.error(err)
      setGlobalError('The adventurer could not be updated. Please try again.')
      setLoading(false)
      return
    }

    router.push(`/${clubYearLabel}/adventurers/${childId}`)
  }

  const name = child ? `${child.firstName ?? child.first_name} ${child.lastName ?? child.last_name}` : 'Adventurer'

  const breadcrumbs = [
    { label: 'Adventurers', href: `/${clubYearLabel}/adventurers` },
    { label: name, href: `/${clubYearLabel}/adventurers/${childId}` },
    { label: 'Edit' },
  ]

  return (
    <FormPage
      title="Edit Adventurer"
      description="Update the adventurer's details below."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Save Changes"
      submitLoadingLabel="Saving…"
      loading={loading}
      contentLoading={contentLoading || classesLoading}
    >
      <AdventurerForm data={child ?? {}} classes={classes} />
    </FormPage>
  )
}
