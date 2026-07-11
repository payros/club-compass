import { Suspense } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'

export async function generateMetadata({ params }) {
  const { club_year_label } = await params
  return { title: generateTitle('Add Classes', club_year_label) }
}

const Page = () => {
  return (
    <Suspense>
      <View />
    </Suspense>
  )
}

export default Page
