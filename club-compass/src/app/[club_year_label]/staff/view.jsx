'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import useStaff from '@/hooks/useStaff'
import CollectionPage from '@/components/pages/CollectionPage'

const headers = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'class', label: 'Class', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'backgroundCheckExpiration', label: 'Background Check Expiration', sortable: true },
]

export default function View() {
  const clubYearLabel = useParams()['club_year_label']
  const router = useRouter()
  const { staff, loading } = useStaff(clubYearLabel)

  const breadcrumbs = [{ label: 'Staff' }]

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      title="Staff"
      description={`${staff?.length ?? 0} staff members enrolled in the ${clubYearLabel} club year`}
      headers={headers}
      data={staff}
      loading={loading}
      badge={staff?.length ?? 0}
      onRowClick={(item) => router.push(`/${clubYearLabel}/staff/${item.id}`)}
    />
  )
}
