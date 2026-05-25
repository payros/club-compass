import { Suspense } from 'react'
import View from './view.jsx'

export const metadata = {
  title: 'Add Classes',
  description: 'Assign instructors to each class for a club year',
}

const Page = () => {
  return (
    <Suspense>
      <View />
    </Suspense>
  )
}

export default Page
