import View from './view.jsx'
import { generateTitle, fromSnakeCaseToTitleCase } from '@/utils/stringUtils'
import classesService from '@/services/classesService'

export async function generateMetadata({ params }) {
  const { club_year_label: clubYearLabel, class_name: className } = await params
  return { title: generateTitle(fromSnakeCaseToTitleCase(className), clubYearLabel) }
}

export default async function Page({ params }) {
  const { club_year_label: clubYearLabel, class_name: className } = await params
  const cls = await classesService.getByName(clubYearLabel, className)
  return <View classData={cls} />
}
