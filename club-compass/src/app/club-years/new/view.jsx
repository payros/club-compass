'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormPage from '@/components/pages/FormPage'
import ClubYearForm from '@/components/forms/ClubYearForm'
import { useFlow } from '@/hooks/useFlow'
import useClubYears from '@/hooks/useClubYears'
import { localDateToISO } from '@/utils/dateUtils'

const View = () => {
  const router = useRouter()
  const { getNextPath, current, total } = useFlow()
  const [loading, setLoading] = useState(false)
  const [labelError, setLabelError] = useState(null)
  const [globalError, setGlobalError] = useState(null)
  const { clubYears, loading: prefillLoading } = useClubYears()
  const { startDate, endDate, label, ...prefillData } = clubYears[0] ?? {}

  async function handleSubmit(event) {
    event.preventDefault()
    setLabelError(null)
    setGlobalError(null)
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    if (!data.clubName?.trim() || !data.label?.trim()) {
      setGlobalError('Please fill out all required fields.')
      return
    }

    setLoading(true)
    data.startDate = localDateToISO(data.startDate)
    data.endDate = localDateToISO(data.endDate)

    try {
      const response = await fetch('/api/club-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        if (result?.field === 'label') {
          setLabelError(result.error)
        } else {
          setGlobalError(result?.error ?? 'The form could not be submitted due to an error. Please try again later.')
        }
        setLoading(false)
        return
      }
      if (result?.[0]?.label) {
        const label = result[0].label
        const nextPath = getNextPath?.({ club_year_label: label })
        router.push(nextPath ?? `/${label}/dashboard`)
      }
    } catch (err) {
      console.error(err)
      setGlobalError('The form could not be submitted due to an error. Please try again.')
      setLoading(false)
    }
  }

  const breadcrumbs = [{ label: 'Club Years', href: '/club-years' }, { label: 'New Club Year' }]

  return (
    <FormPage
      title="New Club Year"
      description="Fill in the information below to create a new club year."
      breadcrumbs={breadcrumbs}
      globalError={globalError}
      handleSubmit={handleSubmit}
      submitLabel="Create Club Year"
      submitLoadingLabel="Creating Club Year…"
      loading={loading}
      contentLoading={prefillLoading}
      current={current}
      total={total}
    >
      <ClubYearForm labelError={labelError} data={prefillData} />
    </FormPage>
  )
}

export default View
