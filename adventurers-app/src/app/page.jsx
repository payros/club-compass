import { redirect } from 'next/navigation'
import clubYearsService from '@/services/clubYearsService'

const Home = async () => {
  console.log('loading club years...')
  const clubYears = await clubYearsService.list()
  console.log('club years loaded:', clubYears)
  if (clubYears.length > 0) {
    const [latestClubYear] = clubYears
    redirect(`/${latestClubYear.label}/dashboard`)
  } else {
    redirect('/club-years/new?flow=setup')
  }

  return <h1>Loading...</h1>
}

export default Home
