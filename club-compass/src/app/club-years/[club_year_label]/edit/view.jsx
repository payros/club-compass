'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import ClubYearForm from '@/components/forms/ClubYearForm'
import { localDateToISO } from '@/utils/dateUtils'

export default function View({ clubYear: serverClubYear }) {
  const { club_year_label: currentLabel } = useParams()
  const router = useRouter()

  const [clubYear, setClubYear] = useState(serverClubYear ?? null)
  const [loading, setLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(!serverClubYear)
  const [labelError, setLabelError] = useState(null)
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    if (serverClubYear) return
    fetch(`/api/club-years/${currentLabel}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        setClubYear(data)
        setContentLoading(false)
      })
      .catch(() => {
        setGlobalError('Could not load club year data. Please try again.')
        setContentLoading(false)
      })
  }, [currentLabel])

  async function handleSubmit(event) {
    event.preventDefault()
    setLabelError(null)
    setGlobalError(null)
    setLoading(true)

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
data.startDate = localDateToISO(data.startDate)
data.endDate = localDateToISO(data.endDate)

    try {
      const response = await fetch(`/api/club-years/${currentLabel}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        if (result?.field === 'label') {
          setLabelError(result.error)
        } else {
          setGlobalError(result?.error ?? 'The club year could not be updated. Please try again.')
        }
        setLoading(false)
        return
      }
      const newLabel = result.label ?? currentLabel
      router.push(`/club-years/${newLabel}`)
    } catch (err) {
      console.error(err)
      setGlobalError('The club year could not be updated. Please try again.')
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Club Years', href: '/club-years' },
    { label: clubYear?.label ?? currentLabel, href: `/club-years/${currentLabel}` },
    { label: 'Edit' },
  ]

  return (
    <FormPage
      title="Edit Club Year"
      description="Update the club year details below."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Save Changes"
      submitLoadingLabel="Saving…"
      loading={loading}
      contentLoading={contentLoading}
    >
      <ClubYearForm data={clubYear ?? {}} labelError={labelError} />
    </FormPage>
  )
}
