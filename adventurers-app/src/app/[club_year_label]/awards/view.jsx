'use client'
import { useParams, useRouter } from 'next/navigation'
import useAwards from '@/hooks/useAwards'
import CollectionPage from '@/components/pages/CollectionPage'

const headers = [
  { key: 'name', label: 'Name', sortable: false },
  { key: 'type', label: 'Type', sortable: false },
  { key: 'class', label: 'Class', sortable: false },
  { key: 'linkLabel', label: 'Link', hrefKey: 'link', hrefExternal: true, sortable: false },
]

export default function View() {
  const clubYearLabel = useParams()['club_year_label']
  const router = useRouter()
  const { awards, loading } = useAwards(clubYearLabel)

  const breadcrumbs = [{ label: clubYearLabel, href: `/${clubYearLabel}/dashboard` }, { label: 'Awards' }]

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      title="Awards"
      description={`Awards for the ${clubYearLabel} club year`}
      headers={headers}
      data={awards}
      loading={loading}
      badge={awards?.length ?? 0}
      onRowClick={(item) => router.push(`/${clubYearLabel}/awards/${item.id}`)}
    />
  )
}
