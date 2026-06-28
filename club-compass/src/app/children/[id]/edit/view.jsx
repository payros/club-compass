'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import ChildForm from '@/components/forms/ChildForm'

export default function View() {
  const { id } = useParams()
  const router = useRouter()
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(true)
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        setChild(data)
        setContentLoading(false)
      })
      .catch(() => {
        setGlobalError('Could not load child data. Please try again.')
        setContentLoading(false)
      })
  }, [id])

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
    }

    try {
      const response = await fetch(`/api/children/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        setGlobalError(result?.error ?? 'The child could not be updated. Please try again.')
        setLoading(false)
        return
      }
    } catch (err) {
      console.error(err)
      setGlobalError('The child could not be updated. Please try again.')
      setLoading(false)
      return
    }

    router.push(`/children/${id}`)
  }

  const name = child ? `${child.firstName ?? child.first_name} ${child.lastName ?? child.last_name}` : 'Child'

  const breadcrumbs = [
    { label: 'Children', href: '/children' },
    { label: name, href: `/children/${id}` },
    { label: 'Edit' },
  ]

  return (
    <FormPage
      title="Edit Child"
      description="Update the child's details below."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Save Changes"
      submitLoadingLabel="Saving…"
      loading={loading}
      contentLoading={contentLoading}
    >
      <ChildForm data={child ?? {}} />
    </FormPage>
  )
}
