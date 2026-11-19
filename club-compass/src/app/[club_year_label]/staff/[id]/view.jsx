'use client'
import { useParams } from 'next/navigation'
import ResourcePage from '@/components/pages/ResourcePage'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import { transformStaffMember } from '@/utils/transformUtils'
import CertificateStatusIcon from '@/components/CertificateStatusIcon'
import { isDateInPast } from '@/utils/dateUtils'

export default function View({ staffMember: staffMemberData }) {
  const { club_year_label: clubYearLabel, id } = useParams()
  const staffMember = staffMemberData ? transformStaffMember(staffMemberData) : null
  const loading = false

  const name = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Staff Member'

  const breadcrumbs = [
    { label: clubYearLabel, href: `/${clubYearLabel}/dashboard` },
    { label: 'Staff', href: `/${clubYearLabel}/staff` },
    { label: name },
  ]

  const actions = [{ label: 'Upload Certificate', href: `/staff/${id}/certificate-upload` }]

  const fields = staffMember
    ? [
        { label: 'Email', value: staffMember.email ?? '—' },
        { label: 'Phone', value: staffMember.phone ?? '—' },
        {
          label: 'Background Check Expiration',
          value: staffMember.backgroundCheckExpiration ?? '—',
          href: staffMember.certificateUrl ?? undefined,
          icon: staffMemberData.backgroundCheckExpiration ? (
            <CertificateStatusIcon status={isDateInPast(staffMemberData.backgroundCheckExpiration) ? 'expired' : 'current'} />
          ) : undefined,
        },
        { label: 'Role', value: staffMember.staffRole ? fromSnakeCaseToTitleCase(staffMember.staffRole) : '—' },
        ...(staffMember.instructorClass
          ? [{ label: 'Class', value: fromSnakeCaseToTitleCase(staffMember.instructorClass) }]
          : []),
      ]
    : []

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      title={name}
      subtitle="Staff Member"
      loading={loading}
      fields={fields}
      actions={actions}
    />
  )
}
