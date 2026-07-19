'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import ChildForm from '@/components/forms/ChildForm'
import { localDateToISO } from '@/utils/dateUtils'

export default function View({ child: serverChild }) {
  const { id } = useParams()
  const router = useRouter()
  const [child, setChild] = useState(serverChild ?? null)
  const [loading, setLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(!serverChild)
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    if (serverChild) return
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
    const profileFile = formData.get('profile_image') || null

    const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE ?? '1048576', 10)
    if (profileFile?.size > MAX_FILE_SIZE) {
      const limitMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)
      setGlobalError(
        `The profile image is too large (${(profileFile.size / (1024 * 1024)).toFixed(2)} MB). Please select an image under ${limitMB} MB.`
      )
      setLoading(false)
      return
    }

    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      dateOfBirth: localDateToISO(formData.get('dateOfBirth')),
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

    if (profileFile?.size > 0) {
      try {
        const uploadData = new FormData()
        uploadData.append('file', profileFile)
        const uploadRes = await fetch(`/api/children/${id}/photo`, {
          method: 'POST',
          body: uploadData,
        })
        if (!uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          setGlobalError(uploadResult?.error ?? 'Child updated, but profile image upload failed.')
          setLoading(false)
          router.push(`/children/${id}`)
          return
        }
      } catch (err) {
        console.error(err)
      }
    }

    router.push(`/children/${id}`)
  }

  const name = child ? `${child.firstName} ${child.lastName}` : 'Child'

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
