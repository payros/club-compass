'use client'
import { useRouter } from 'next/navigation'
import useChildren from '@/hooks/useChildren'
import useClubYears from '@/hooks/useClubYears'
import useParents from '@/hooks/useParents'
import useStaff from '@/hooks/useStaff'
import useAwards from '@/hooks/useAwards'
import DashboardPage from '@/components/pages/DashboardPage'

export default function View() {
  const router = useRouter()
  const { children, loading: loadingAllChildren } = useChildren()
  const { clubYears, loading: loadingClubYears } = useClubYears()
  const { parents, loading: loadingParents } = useParents()
  const { staff, loading: loadingStaff } = useStaff()
  const { awards, loading: loadingAwards } = useAwards()

  const breadcrumbs = [{ label: 'Directories' }]

  const actions = [
    {
      label: 'Add Club Year',
      href: `/club-years/new`,
    },
    {
      label: 'Add Child',
      href: `/children/new`,
    },
    {
      label: 'Add Parent',
      href: `/parents/new`,
    },
    {
      label: 'Add Staff',
      href: `/staff/new`,
    },
  ]

  const cards = [
    {
      title: 'All Children',
      href: `/children`,
      badge: children?.length ?? 0,
      headers: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'age', label: 'Age', sortable: true },
      ],
      data: children,
      loading: loadingAllChildren,
      onRowClick: (item) => router.push(`/children/${item.id}`),
    },
    {
      title: 'All Parents',
      href: `/parents`,
      headers: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'phone', label: 'Phone', sortable: true },
      ],
      data: parents,
      loading: loadingParents,
      onRowClick: (item) => router.push(`/parents/${item.id}`),
    },
    {
      title: 'All Staff',
      href: `/staff`,
      headers: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
      ],
      data: staff,
      loading: loadingStaff,
      onRowClick: (item) => router.push(`/staff/${item.id}`),
    },
    {
      title: 'Club Years',
      href: `/club-years`,
      headers: [
        { key: 'clubName', label: 'Club Name', sortable: true },
        { key: 'label', label: 'Year Label', sortable: true },
      ],
      data: clubYears,
      loading: loadingClubYears,
      onRowClick: (item) => router.push(`/club-years/${item.label}`),
    },
    {
      title: 'All Awards',
      href: `/awards`,
      badge: awards?.length ?? 0,
      headers: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'level', label: 'Level', sortable: true },
        { key: 'class', label: 'Class', sortable: true },
      ],
      data: awards,
      loading: loadingAwards,
      onRowClick: (item) => router.push(`/awards/${item.id}`),
    },
  ]

  return <DashboardPage breadcrumbs={breadcrumbs} actions={actions} cards={cards} />
}
