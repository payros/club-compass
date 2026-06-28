'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import AwardsForm from '@/components/forms/AwardsForm'

const View = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)

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

    let newId
    try {
      const response = await fetch('/api/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        setGlobalError(result?.error ?? 'The award could not be created. Please try again.')
        setLoading(false)
        return
      }
      newId = result.id
    } catch (err) {
      console.error(err)
      setGlobalError('The award could not be created. Please try again.')
      setLoading(false)
      return
    }

    if (patchFile?.size > 0 && newId) {
      try {
        const uploadData = new FormData()
        uploadData.append('file', patchFile)
        const uploadRes = await fetch(`/api/awards/${newId}/photo`, {
          method: 'POST',
          body: uploadData,
        })
        if (!uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          // Award was created — redirect anyway, but surface the upload error
          setGlobalError(uploadResult?.error ?? 'Award created, but patch image upload failed.')
          setLoading(false)
          router.push(`/awards/${newId}`)
          return
        }
      } catch (err) {
        console.error(err)
        // Non-fatal: award exists, image just didn't upload
      }
    }

    router.push(`/awards/${newId}`)
  }

  const breadcrumbs = [{ label: 'Awards', href: '/awards' }, { label: 'New Award' }]

  return (
    <FormPage
      title="New Award"
      description="Fill in the information below to add a new award."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Create Award"
      submitLoadingLabel="Creating Award…"
      loading={loading}
    >
      <AwardsForm />
    </FormPage>
  )
}

export default View
