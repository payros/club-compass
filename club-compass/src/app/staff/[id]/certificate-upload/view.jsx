'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Field, Input } from '@chakra-ui/react'
import FormPage from '@/components/pages/FormPage'
import { localDateToISO, tomorrowAsInputDate } from '@/utils/dateUtils'

const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_CERTIFICATE_UPLOAD_SIZE ?? '5242880', 10)

export default function View({ staffMember }) {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  const name = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Staff Member'

  const breadcrumbs = [
    { label: 'Staff Directory', href: '/staff' },
    { label: name, href: `/staff/${id}` },
    { label: 'Upload Certificate' },
  ]

  async function handleSubmit(event) {
    event.preventDefault()
    setGlobalError(null)

    const formData = new FormData(event.target)
    const file = formData.get('file')
    const expirationDate = formData.get('expiration')

    if (!file || file.size === 0) {
      setGlobalError('Please select a certificate PDF.')
      return
    }
    if (file.type !== 'application/pdf') {
      setGlobalError('The certificate must be a PDF file.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      const limitMB = Math.round(MAX_FILE_SIZE / (1024 * 1024))
      setGlobalError(`The certificate is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum size is ${limitMB} MB.`)
      return
    }
    if (!expirationDate) {
      setGlobalError('Please enter the certificate expiration date.')
      return
    }
    const expiration = localDateToISO(expirationDate)
    if (new Date(expiration) <= new Date()) {
      setGlobalError('The certificate expiration date must be in the future.')
      return
    }

    setLoading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('expiration', expiration)
      const response = await fetch(`/api/staff/${id}/certificate`, { method: 'POST', body: uploadData })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        setGlobalError(result?.error ?? 'The certificate could not be uploaded. Please try again.')
        setLoading(false)
        return
      }
    } catch (err) {
      console.error(err)
      setGlobalError('The certificate could not be uploaded. Please try again.')
      setLoading(false)
      return
    }

    router.push(`/staff/${id}`)
    router.refresh()
  }

  return (
    <FormPage
      title="Upload Certificate"
      description={`Upload the background check certificate for ${name}.`}
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Upload Certificate"
      submitLoadingLabel="Uploading…"
      loading={loading}
    >
      <Field.Root required>
        <Field.Label>Certificate (PDF)</Field.Label>
        <Input name="file" type="file" accept="application/pdf" required pt={1} />
      </Field.Root>
      <Field.Root required>
        <Field.Label>Certificate Expiration Date</Field.Label>
        <Input name="expiration" type="date" min={tomorrowAsInputDate()} required />
      </Field.Root>
    </FormPage>
  )
}
