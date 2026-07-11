import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'

export async function generateMetadata({ params }) {
  const { club_year_label } = await params
  return { title: generateTitle('Enroll a Family', club_year_label) }
}

const Page = () => {
  return <View />
}

export default Page
