import { redirect } from 'next/navigation'
import clubYearsService from '@/services/clubYearsService'

export const dynamic = 'force-dynamic'

const DashboardPage = async () => {
  const clubYears = await clubYearsService.list()

  if (clubYears.length > 0) {
    const [latestClubYear] = clubYears
    redirect(`/${latestClubYear.label}/dashboard`)
  }

  redirect('/club-years/new?flow=setup')
}

export default DashboardPage
