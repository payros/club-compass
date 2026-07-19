'use client'
import { useParams } from 'next/navigation'
import ResourcePage from '@/components/pages/ResourcePage'
import { transformStaffMember } from '@/utils/transformUtils'

export default function View({ staffMember: staffMemberData }) {
  const { id } = useParams()
  const staffMember = staffMemberData ? transformStaffMember(staffMemberData) : null
  const loading = false

  const name = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Staff Member'

  const breadcrumbs = [{ label: 'Staff Directory', href: '/staff' }, { label: name }]

  const fields = staffMember
    ? [
        { label: 'Email', value: staffMember.email ?? '—' },
        { label: 'Phone', value: staffMember.phone ?? '—' },
        { label: 'Background Check Expiration', value: staffMember.backgroundCheckExpiration ?? '—' },
      ]
    : []

  return (
    <ResourcePage breadcrumbs={breadcrumbs} title={name} subtitle="Staff Member" loading={loading} fields={fields} />
  )
}
