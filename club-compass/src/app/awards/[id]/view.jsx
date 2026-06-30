'use client'
import { useParams, useRouter } from 'next/navigation'
import useAward from '@/hooks/useAward'
import ResourcePage from '@/components/pages/ResourcePage'

export default function View() {
  const { id } = useParams()
  const router = useRouter()
  const { award, loading } = useAward(id)

  const breadcrumbs = [{ label: 'Awards', href: '/awards' }, { label: award?.name ?? 'Award' }]

  const actions = [
    {
      label: 'Edit Award',
      href: `/awards/${id}/edit`,
    },
  ]

  const fields = award
    ? [
        { label: 'Type', value: award.type ?? '—' },
        { label: 'Level', value: award.level ?? 'No level (multi-level award)' },
        { label: 'Link', value: award.linkLabel ?? '—', href: award.link || undefined },
      ]
    : []

  const relatedCards = [
    {
      title: 'Awarded Children',
      badge: award?.childrenAwarded?.length ?? 0,
      headers: [
        { key: 'name', label: 'Name', sortable: false },
        { key: 'earnedOn', label: 'Earned On', sortable: false },
      ],
      data: award?.childrenAwarded ?? [],
      loading,
      width: 'large',
      onRowClick: (item) => router.push(`/children/${item.id}`),
    },
  ]

  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      title={award?.name ?? 'Award'}
      loading={loading}
      fields={fields}
      relatedCards={relatedCards}
      imageUrl={award?.patchImageUrl}
      actions={actions}
    />
  )
}
