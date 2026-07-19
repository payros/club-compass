import { cache } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import clubYearsService from '@/services/clubYearsService'

const getClubYear = cache(async (label) => clubYearsService.getByLabel(label))

export async function generateMetadata({ params }) {
  const { club_year_label: label } = await params
  return { title: generateTitle(`Edit ${label}`) }
}

export default async function Page({ params }) {
  const { club_year_label: label } = await params
  const clubYear = await getClubYear(label)
  return <View clubYear={clubYear} />
}
