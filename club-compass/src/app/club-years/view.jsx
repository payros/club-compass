'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useClubYears from '@/hooks/useClubYears'
import CollectionPage from '@/components/pages/CollectionPage'
import { fromDateToString } from '@/utils/dateUtils'

const headers = [
  { key: 'label', label: 'Label', sortable: false },
  { key: 'clubName', label: 'Club Name', sortable: false },
  { key: 'churchName', label: 'Church Name', sortable: false },
  { key: 'startDate', label: 'Start Date', sortable: false },
  { key: 'endDate', label: 'End Date', sortable: false },
  { key: 'enrolledAdventurers', label: 'Enrolled Adventurers', sortable: false },
  { key: 'viewYear', label: '', sortable: false, type: 'link', hrefKey: 'dashboardHref' },
]

export default function View() {
  const { clubYears, loading } = useClubYears()
  const router = useRouter()

  const data = clubYears.map((cy) => ({
    id: cy.id,
    label: cy.label,
    clubName: cy.clubName ?? '—',
    churchName: cy.churchName ?? '—',
    startDate: cy.startDate ? fromDateToString(cy.startDate) : '—',
    endDate: cy.endDate ? fromDateToString(cy.endDate) : '—',
    enrolledAdventurers: cy.enrolledAdventurers ?? 0,
    viewYear: 'View Year',
    dashboardHref: `/${cy.label}/dashboard`,
  }))

  const breadcrumbs = [{ label: 'Club Years' }]

  const actions = (
    <Link href="/club-years/new">
      <button
        className="accent-btn"
        style={{
          padding: '0.5rem 1.1rem',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          border: 'none',
        }}
      >
        + New Club Year
      </button>
    </Link>
  )

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      title="Club Years"
      description="All club years on record"
      headers={headers}
      data={data}
      loading={loading}
      badge={clubYears.length}
      actions={actions}
      onRowClick={(item) => router.push(`/club-years/${item.label}`)}
    />
  )
}
