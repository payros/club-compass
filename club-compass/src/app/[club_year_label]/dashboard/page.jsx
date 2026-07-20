import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import childrenService from '@/services/childrenService'
import eventsService from '@/services/eventsService'
import staffService from '@/services/staffService'
import classesService from '@/services/classesService'
import awardsService from '@/services/awardsService'
import clubYearsService from '@/services/clubYearsService'

export async function generateMetadata({ params }) {
  const { club_year_label } = await params
  return { title: generateTitle('Dashboard', club_year_label) }
}

export default async function Page({ params }) {
  const { club_year_label: clubYearLabel } = await params
  const [children, events, staff, classes, awards, clubYear] = await Promise.all([
    childrenService.listByClubYear(clubYearLabel),
    eventsService.listByClubYear(clubYearLabel),
    staffService.list(undefined, clubYearLabel),
    classesService.listByClubYear(clubYearLabel),
    awardsService.list(clubYearLabel),
    clubYearsService.getByLabel(clubYearLabel),
  ])
  return (
    <View children={children} events={events} staff={staff} classes={classes} awards={awards} clubYear={clubYear} />
  )
}
