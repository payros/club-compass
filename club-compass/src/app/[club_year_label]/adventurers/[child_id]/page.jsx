import { cache } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import childrenService from '@/services/childrenService'

const getChild = cache(async (childId, clubYearLabel) => childrenService.getById(childId, clubYearLabel))

export async function generateMetadata({ params }) {
  const { club_year_label: clubYearLabel, child_id: childId } = await params
  const child = await getChild(childId, clubYearLabel)
  const name = child ? `${child.firstName} ${child.lastName}` : 'Adventurer'
  return { title: generateTitle(name, clubYearLabel) }
}

export default async function Page({ params }) {
  const { club_year_label: clubYearLabel, child_id: childId } = await params
  const child = await getChild(childId, clubYearLabel)
  return <View child={child} />
}
