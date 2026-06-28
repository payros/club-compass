'use client'
import { useRouter } from 'next/navigation'
import useAwards from '@/hooks/useAwards'
import CollectionPage from '@/components/pages/CollectionPage'

const headers = [
  { key: 'patchImageUrl', label: 'Logo', type: 'image', sortable: false },
  { key: 'name', label: 'Name', sortable: false },
  { key: 'type', label: 'Type', sortable: false },
  { key: 'class', label: 'Class', sortable: false },
  { key: 'linkLabel', label: 'Link', hrefKey: 'link', hrefExternal: true, sortable: false },
]

export default function View() {
  const router = useRouter()
  const { awards, loading } = useAwards()

  const breadcrumbs = [{ label: 'Awards' }]

  const actions = [
    {
      label: 'New Award',
      href: `/awards/new`,
    },
  ]

  return (
    <CollectionPage
      breadcrumbs={breadcrumbs}
      title="Awards"
      description="All available awards"
      headers={headers}
      data={awards}
      loading={loading}
      onRowClick={(item) => router.push(`/awards/${item.id}`)}
      actions={actions}
    />
  )
}
