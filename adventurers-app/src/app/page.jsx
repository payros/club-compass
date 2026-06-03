import { redirect } from 'next/navigation'
import clubYearsService from '@/services/clubYearsService'

const Home = async () => {
  console.error('[page] Home: fetching club years')
  const clubYears = await clubYearsService.list()
  console.error(`[page] Home: club years count = ${clubYears.length}`)
  if (clubYears.length > 0) {
    const [latestClubYear] = clubYears
    redirect(`/${latestClubYear.label}/dashboard`)
  } else {
    redirect('/club-years/new?flow=setup')
  }

  return <h1>Loading...</h1>
}

export default Home
