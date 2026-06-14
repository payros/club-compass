'use client'
import { useParams, useRouter } from 'next/navigation'
import useAward from '@/hooks/useAward'
import ResourcePage from '@/components/pages/ResourcePage'

export default function View() {
  const { club_year_label: clubYearLabel, award_id: awardId } = useParams()
  const router = useRouter()
  const { award, loading } = useAward(awardId, clubYearLabel)

  const breadcrumbs = [{ label: 'Awards', href: `/${clubYearLabel}/awards` }, { label: award?.name ?? 'Award' }]

  const fields = award
    ? [
        { label: 'Type', value: award.type ?? '—' },
        { label: 'Class', value: award.level ?? '—' },
        { label: 'Link', value: award.linkLabel ?? '—', href: award.link || undefined },
      ]
    : []

  const relatedCards = [
    {
      title: 'Awarded Children',
      headers: [
        { key: 'name', label: 'Name', sortable: false },
        { key: 'class', label: 'Class', sortable: false },
        { key: 'earnedOn', label: 'Earned On', sortable: false },
      ],
      data: award?.childrenAwarded ?? [],
      loading,
      onRowClick: (item) => router.push(`/${clubYearLabel}/adventurers/${item.id}`),
    },
  ]
  console.log('award?.patchImageUrl', award?.patchImageUrl)
  return (
    <ResourcePage
      breadcrumbs={breadcrumbs}
      clubName={`${clubYearLabel} Club`}
      title={award?.name ?? 'Award'}
      loading={loading}
      fields={fields}
      relatedCards={relatedCards}
      imageUrl={award?.patchImageUrl}
    />
  )
}
