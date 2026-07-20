import { cache } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import childrenService from '@/services/childrenService'
import clubYearsService from '@/services/clubYearsService'

const getChild = cache(async (childId, clubYearLabel) => childrenService.getById(childId, clubYearLabel))
const getClubYear = cache(async (label) => clubYearsService.getByLabel(label))

export async function generateMetadata({ params }) {
  const { club_year_label: clubYearLabel, child_id: childId } = await params
  const child = await getChild(childId, clubYearLabel)
  const name = child ? `${child.firstName} ${child.lastName}` : 'Adventurer'
  return { title: generateTitle(name, clubYearLabel) }
}

export default async function Page({ params }) {
  const { club_year_label: clubYearLabel, child_id: childId } = await params
  const [child, clubYear] = await Promise.all([getChild(childId, clubYearLabel), getClubYear(clubYearLabel)])
  return <View child={child} clubYear={clubYear} />
}
