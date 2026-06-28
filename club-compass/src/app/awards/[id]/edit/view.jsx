'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import AwardsForm from '@/components/forms/AwardsForm'

export default function View() {
  const { id } = useParams()
  const router = useRouter()
  const [award, setAward] = useState(null)
  const [loading, setLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(true)
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    fetch(`/api/awards/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        setAward(data)
        setContentLoading(false)
      })
      .catch(() => {
        setGlobalError('Could not load award data. Please try again.')
        setContentLoading(false)
      })
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    setGlobalError(null)
    setLoading(true)

    const formData = new FormData(event.target)
    const patchFile = formData.get('patch_image') || null

    const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE ?? '1048576', 10)
    if (patchFile?.size > MAX_FILE_SIZE) {
      const limitMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)
      setGlobalError(
        `The patch image is too large (${(patchFile.size / (1024 * 1024)).toFixed(2)} MB). Please select an image under ${limitMB} MB.`
      )
      setLoading(false)
      return
    }

    const data = {
      name: formData.get('name'),
      type: formData.get('type'),
      level: formData.get('level') || null,
      link: formData.get('link') || null,
    }

    try {
      const response = await fetch(`/api/awards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        setGlobalError(result?.error ?? 'The award could not be updated. Please try again.')
        setLoading(false)
        return
      }
    } catch (err) {
      console.error(err)
      setGlobalError('The award could not be updated. Please try again.')
      setLoading(false)
      return
    }

    if (patchFile?.size > 0) {
      try {
        const uploadData = new FormData()
        uploadData.append('file', patchFile)
        const uploadRes = await fetch(`/api/awards/${id}/photo`, {
          method: 'POST',
          body: uploadData,
        })
        if (!uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          // Award was updated — redirect anyway, but surface the upload error
          setGlobalError(uploadResult?.error ?? 'Award updated, but patch image upload failed.')
          setLoading(false)
          router.push(`/awards/${id}`)
          return
        }
      } catch (err) {
        console.error(err)
        // Non-fatal: award updated, image just didn't upload
      }
    }

    router.push(`/awards/${id}`)
  }

  const breadcrumbs = [
    { label: 'Awards', href: '/awards' },
    { label: award?.name ?? 'Award', href: `/awards/${id}` },
    { label: 'Edit' },
  ]

  return (
    <FormPage
      title="Edit Award"
      description="Update the award details below."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Save Changes"
      submitLoadingLabel="Saving…"
      loading={loading}
      contentLoading={contentLoading}
    >
      <AwardsForm data={award ?? {}} />
    </FormPage>
  )
}
