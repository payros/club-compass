'use client'
import { useParams, useRouter } from 'next/navigation'
import useClasses from '@/hooks/useClasses'
import CollectionPage from '@/components/pages/CollectionPage'

const headers = [
  { key: 'class', label: 'Class', sortable: false },
  { key: 'instructor', label: 'Instructor', sortable: false },
]

export default function View() {
  const clubYearLabel = useParams()['club_year_label']
  const router = useRouter()
  const { classes, loading } = useClasses(clubYearLabel)

  const breadcrumbs = [{ label: 'Classes' }]

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      title="Classes"
      description={`Classes for the ${clubYearLabel} club year`}
      headers={headers}
      data={classes}
      loading={loading}
      badge={classes?.length ?? 0}
      onRowClick={(item) => item.slug && router.push(`/${clubYearLabel}/classes/${item.slug}`)}
    />
  )
}
