'use client'
import { useParams } from 'next/navigation'
import useStaffMember from '@/hooks/useStaffMember'
import ResourcePage from '@/components/pages/ResourcePage'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

export default function View() {
  const { club_year_label: clubYearLabel, id } = useParams()
  const { staffMember, loading } = useStaffMember(id, clubYearLabel)

  const name = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Staff Member'

  const breadcrumbs = [
    { label: clubYearLabel, href: `/${clubYearLabel}/dashboard` },
    { label: 'Staff', href: `/${clubYearLabel}/staff` },
    { label: name },
  ]

  const fields = staffMember
    ? [
        { label: 'Email', value: staffMember.email ?? '—' },
        { label: 'Phone', value: staffMember.phone ?? '—' },
        { label: 'Background Check Expiration', value: staffMember.backgroundCheckExpiration ?? '—' },
        { label: 'Role', value: staffMember.staffRole ? fromSnakeCaseToTitleCase(staffMember.staffRole) : '—' },
        ...(staffMember.instructorClass
          ? [{ label: 'Class', value: fromSnakeCaseToTitleCase(staffMember.instructorClass) }]
          : []),
      ]
    : []

  return (
    <ResourcePage breadcrumbs={breadcrumbs} title={name} subtitle="Staff Member" loading={loading} fields={fields} />
  )
}
